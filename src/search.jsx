import React, { useState, useEffect } from 'react';

const mockData = [
  { id: 1, title: 'Charity Water', category: 'Health' },
  { id: 2, title: 'Food Bank Network', category: 'Hunger Relief' },
  { id: 3, title: 'Youth Empowerment Center', category: 'Education' },
  { id: 4, title: 'Habitat for Humanity', category: 'Housing' },
  { id: 5, title: 'Save the Children', category: 'Education' },
  { id: 6, title: 'Red Cross', category: 'Disaster Relief' },
  { id: 7, title: 'Animal Rescue League', category: 'Animals' },
  { id: 8, title: 'Doctors Without Borders', category: 'Health' },
  { id: 9, title: 'Environmental Action Group', category: 'Environment' },
  { id: 10, title: 'Local Community Shelter', category: 'Housing' }
];

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(mockData);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...new Set(mockData.map(item => item.category))];

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = mockData.filter(item => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery || item.title.toLowerCase().includes(normalizedQuery);
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
          placeholder="Search charities..."
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

export default Search;