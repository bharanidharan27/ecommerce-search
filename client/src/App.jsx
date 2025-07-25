import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

function App() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});
    const [selectedFilters, setSelectedFilters] = useState({});
    const [expandedSections, setExpandedSections] = useState({
        brands: true,
        categories: true,
        price_range: true,
        ratings: true
    });

    const fetchSuggestions = async () => {
        if(query.length < 2) return setSuggestions([]);
        try {
            const res = await fetch(`/api/autocomplete?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            setSuggestions(data);
        }
        catch(error) {
            console.error('Autocomplete Failed', error);
            setSuggestions([]);
        }
    }

    const fetchProducts = async () => {
        try {
            if(!query.trim()) return;
            setLoading(true);
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            const json = await response.json();
            setResults(json.data || []);
            setFilters(json.facets || {});
            console.log(filters);
            setLoading(false);
        }
        catch(error) {
            console.error('Search Failed', error);
            setResults([]);
            setFilters({});
        }
    }

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        fetchSuggestions(val);
    }

    const handleEnter = (e) => {
        if(e.key == "Enter") {
            setSuggestions([]);
            fetchProducts();
        }
    }

    const handleSelect = (query) => {
        setSuggestions([]);
        setQuery(query);
        fetchProducts();
    }

    const getSelectedFilterCount = () => {
        return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
    }

    const clearAllFilters = () => {
        setSelectedFilters({});
        fetchProducts();
    }

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
        console.log(expandedSections);
    }

    const formatFilterName = (filter) => {
        return filter.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }

    const clearFilter = (filterType, value) => {
        setSelectedFilters(prev => {
            const newFilters = {...prev};
            if(value) {
                newFilters[filterType] = newFilters[filterType].filter((item) => item !== value);
                if(newFilters[filterType].length === 0) {
                    delete newFilters[filterType];
                }
            }
            return newFilters;
        })
    }

    const handleFilterChange = (filter, value, checked) => {
        setSelectedFilters(prev => {
            const newFilters = {...prev};
            if(!newFilters[filter]) {
                newFilters[filter] = [];
            }

            if(checked) {
                newFilters[filter] = [...newFilters[filter], value];
            }
            else {
                newFilters[filter] = newFilters[filter].filter(item => item !== value);
            }

            if(newFilters[filter].length === 0) {
                delete newFilters[filter];
            }
            return newFilters;
        });
        console.log(selectedFilters);
    }

    return (        
        <div className="min-h-screen bg-gray-50 flex">

            {/* SideBar with faceted navigation */}
            <div className='w-80 bg-white shadow-lg p-6 overflow-y-auto'>
                {/* Filter Header */}
                <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-lg font-semibold text-gray -800'>Filters</h2>
                    {getSelectedFilterCount() > 0 && (
                        <button onClick={clearAllFilters} className='text-sm text-blue-600 hover:text-blue-800 underline'>
                            Clear All ({getSelectedFilterCount()})
                        </button>
                    )}
                </div>

                {/* Active Filters */}
                {Object.keys(selectedFilters).length > 0 && (
                    <div className='mb-6'>
                        <h3 className='text-sm font-medium text-gray-700 mb-2'>Active Filters:</h3>
                        <div className='flex flex-wrap gap-2'>
                            {Object.entries(selectedFilters).map(([filterType, values]) => 
                                values.map(value => (
                                    <span
                                        key={`${filterType}-${value}`}
                                        className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800'
                                    >
                                        {/* Unfinished Business */}
                                        {formatFilterName(filterType)} : {value}
                                        <button
                                            onClick={() => clearFilter(filterType, value)}
                                            className='ml-1 hover:text-blue-600'
                                        >
                                            <X size={12}/>
                                        </button>
                                    </span>
                                ))
                            )}
                        </div>
                    </div> 
                )}

                {/* Filters Section */}
                {Object.entries(filters).map(([filter, filterData]) => (
                    <div key={filter} className='mb-6 border-b border-gray-200 pb-4'>
                        <button
                            onClick={() => toggleSection(filter)}
                            className='flex items-center justify-between w-full text-left mb-3'
                        >
                            <h3 className='font-medium text-gray-800'>
                                {formatFilterName(filter)}
                            </h3>
                            {expandedSections[filter] ? (
                                <ChevronUp size={16} className='text-gray-500'/>
                            ) : (
                                <ChevronDown size={16} className='text-gray-500'/>
                            )}
                        </button>
                        {expandedSections[filter] && (
                            <div className='space-y-2'>
                                {filterData.buckets.map(bucket => (
                                    <label
                                        key={bucket.key}
                                        className='flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded'
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFilters[filter]?.includes(bucket.key) || false}
                                            onChange={(e) => handleFilterChange(filter, bucket.key, e.target.checked)}
                                            className='mr-2 text-blue-600 docus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-700 flex-1'>
                                            {bucket.key}
                                        </span>
                                        <span className='text-sm text-gray-500 ml-2'>
                                            {bucket.doc_count}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Product Search and Listing */}
            <div className='flex-1'>
                <div className='max-w-4xl mx-auto'>
                    <h1 className='text-2xl font-bold mb-6 text-center'>E-commerce Search</h1>
                    <div className="relative mb-6">
                        <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search for products..."
                        value={query}
                        onChange={handleInput}
                        onKeyDown={handleEnter}
                        />
                        {suggestions.length > 0 && (
                        <ul className="absolute z-10 bg-white shadow w-full mt-1 rounded overflow-hidden">
                            {suggestions.map((s, i) => (
                            <li
                                key={i}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                                onClick={() => handleSelect(s)}
                            >
                                {s}
                            </li>
                            ))}
                        </ul>
                        )}
                    </div>

                    {loading && <p className='mt-4 text-center text-gray-500'>Loading...</p>}

                    {!loading && results.length > 0 && (
                        <div>
                            <p className='text-sm text-gray-600 mb-4'>
                                Showing {results.length} results
                                {Object.keys(selectedFilters).length > 0 && (
                                    <span> with {getSelectedFilterCount()} active filters</span> 
                                )}
                            </p>
                            <ul className='space-y-4'>
                                {results.map((item) => (
                                    <li key={item.id} className='p-4 bg-white rounded shadow hover:shadow-md transition-shadow'>
                                        <h2 className="text-lg font-semibold">{item.name}</h2>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                        <div className="text-sm mt-2 flex gap-4">
                                            <span className='text-blue-600 font-medium'>Price: ${item.price}</span>
                                            <span>Brand: {item.brand}</span>
                                            <span>Rating: {item.rating}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!loading && results.length === 0 && suggestions.length === 0 && query && (
                        <p className="text-gray-600 text-center">No Results found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;