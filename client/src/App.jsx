import React, { useState } from 'react';

function App() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSuggestions = async (query) => {
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

    const fetchProducts = async (query) => {
        try {
            if(!query.trim()) return;
            setLoading(true);
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            setResults(data || []);
            setLoading(false);
        }
        catch(error) {
            console.error('Search Failed', error);
            setResults([]);
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
            fetchProducts(query);
        }
    }

    const handleSelect = (query) => {
        setSuggestions([]);
        fetchProducts(query);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">E-commerce Search</h1>

            <div className="w-full max-w-2xl relative">
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
                <ul className='mt-6 space-y-4'>
                    {results.map((item) => (
                        <li key={item.id} className='p-4 bg-white rounded shadow'>
                            <h2 className="text-lg font-semibold">{item.name}</h2>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <div className="text-sm mt-2 flex gap-4">
                                <span className='text-blue-600 font-medium'>Price: {item.price}</span>
                                <span>Brand: {item.brand}</span>
                                <span>Rating: {item.rating}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {!loading && results.length === 0 && suggestions.length === 0 && query && (
                <p className="text-gray-600 text-center">No Results found.</p>
            )}
        </div>
    );
}

export default App;