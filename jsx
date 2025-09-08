import React, { useState, useEffect } from 'react';
import './SearchComponent.css';

const mockData = [
  { id: 1, title: 'React for Beginners', category: 'Web Development' },
  { id: 2, title: 'Advanced Vue Techniques', category: 'Web Development' },
  { id: 3, title: 'Introduction to AI', category: 'Artificial Intelligence' },
  { id: 4, title: 'Learning Python', category: 'Programming' },
  { id: 5, title: 'UX Principles', category: 'Design' },
];

const categories = ['All', 'Web Development', 'Artificial Intelligence', 'Programming', 'Design'];

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(mockData);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let filtered = mockData.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery = !normalizedQuery || item.title.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });

    setResults(filtered);
  }, [query, selectedCategory]);

  return (
    <div className="search-container">
      <h2>🔍 Search & Discover</h2>

      <div className="search-controls">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <ul className="results-list">
        {results.length > 0 ? (
          results.map(item => (
            <li key={item.id}>
              <strong>{item.title}</strong> <em>({item.category})</em>
            </li>
          ))
        ) : (
          <li>No results found.</li>
        )}
      </ul>
    </div>
  );
};

export default SearchComponent;