import React, { useState } from 'react';

function App() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [results, setResults] = useState([]);

    const fetchSuggestions = async (query) => {
        if(query.length < 2) return setSuggestions([]);
        try {
            const res = await fetch(`/api/autocomplete?query=${query}`);
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
            const response = await fetch(`/api/search?query=${query}`);
            const data = await response.json();
            setResults(data);
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
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">E-commerce Search</h1>

            <div className="w-full max-w-2xl relative">
                <input
                type="text"
                className="w-full p-3 border rounded shadow"
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

            <div className="mt-6 w-full max-w-2xl space-y-4">
                {results.length === 0 ? (
                <p className="text-gray-600 text-center">No products to show</p>
                ) : (
                results.map((p, i) => (
                    <div key={i} className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold">{p.name}</h2>
                    <p className="text-gray-600">{p.description || "No description"}</p>
                    <p className="text-sm text-gray-500">
                        {p.brand} | ₹{p.price} | Rating: {p.rating}
                    </p>
                    </div>
                ))
                )}
            </div>
        </div>
    );
}

export default App;