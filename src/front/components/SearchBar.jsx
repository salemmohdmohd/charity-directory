import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizationService } from '../Services/axios';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.length > 0) {
        setLoading(true);
        try {
          const response = await organizationService.searchOrganizations(query, 5);
          const results = response.data.results || [];
          setSuggestions(results);
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300); // Debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (organization) => {
    setQuery('');
    setSuggestions([]);
    navigate(`/organizations/${organization.id}-${organization.name.toLowerCase().replace(/ /g, '-')}`);
  };

  return (
    <div className="position-relative" ref={searchRef}>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Search Orgs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn bg-calcifer text-white" type="button" onClick={() => navigate('/search')} title="Advanced Filters">
          <i className="fas fa-filter"></i>
          <i className="fas fa-chevron-right ms-1"></i>
        </button>
        {loading && (
          <span className="input-group-text">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </span>
        )}
      </div>
      {suggestions.length > 0 && (
        <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
          {suggestions.map((org) => (
            <li
              key={org.id}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelect(org)}
              style={{ cursor: 'pointer' }}
            >
              {org.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
