import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizationService } from '../Services/axios';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { OrganizationCard } from '../components';

const Search = () => {
  const { store } = useGlobalReducer();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchCounter, setSearchCounter] = useState(0);
  const navigate = useNavigate();

  // Suggestions state
  const [querySuggestions, setQuerySuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Refs to handle clicks outside
  const searchContainerRef = useRef(null);

  // Categories are now from global store, no need for local fetch
  const categories = ['All', ...(store.categories || []).map(cat => cat.name)];

  // Combined effect for initial load and subsequent searches
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        const params = {};
        if (query) params.query = query;
        if (location) params.location = location;
        if (selectedCategory !== 'All') params.category = selectedCategory;

        // If it's the initial load (searchCounter is 0) and there are no filters,
        // you might want to call a different endpoint for "all organizations"
        // or just let advancedSearch handle empty params.
        const response = await organizationService.advancedSearch(params);
        setResults(response.data.results || []);
      } catch (error) {
        console.error('Error performing search:', error);
        setResults([]);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    // Run on initial load and on subsequent search clicks
    performSearch();
  }, [searchCounter]);

  // Debounced fetch for query suggestions
  useEffect(() => {
    if (query.length < 2) {
      setQuerySuggestions([]);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const response = await organizationService.searchOrganizations(query, 5);
        setQuerySuggestions(response.data.results || []);
        setShowQuerySuggestions(true);
      } catch (error) {
        console.error('Error fetching query suggestions:', error);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Debounced fetch for location suggestions
  useEffect(() => {
    if (location.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const response = await organizationService.getLocationSuggestions(location);
        setLocationSuggestions(response.data || []);
        setShowLocationSuggestions(true);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [location]);

  // Handle clicks outside to close suggestion lists
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowQuerySuggestions(false);
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    setSearchCounter(prev => prev + 1); // Increment to trigger search
  };

  const handleSelectOrganization = (org) => {
    // Use the same slug creation logic as in Categories.jsx
    const orgSlug = `${org.id}-${org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    navigate(`/organizations/${orgSlug}`);
  };

  const handleQuerySuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    setShowQuerySuggestions(false);
  };

  const handleLocationSuggestionClick = (suggestion) => {
    setLocation(suggestion);
    setShowLocationSuggestions(false);
  };

  return (
    <div className="container mt-5" ref={searchContainerRef}>
      <h2 className="mb-4 text-forest">Search & Discover Organizations</h2>

      <div className="row mb-4 g-3 align-items-center p-3 bg-light rounded shadow-sm">
        {/* Query Input with Suggestions */}
        <div className="col-md-5 position-relative">
          <label htmlFor="query-input" className="form-label fw-bold">Name or Keyword</label>
          <input
            id="query-input"
            type="text"
            className="form-control"
            placeholder="e.g., 'Food Bank', 'Animal Shelter'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 1 && setShowQuerySuggestions(true)}
          />
          {showQuerySuggestions && querySuggestions.length > 0 && (
            <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
              {querySuggestions.map((org) => (
                <li
                  key={org.id}
                  className="list-group-item list-group-item-action"
                  onMouseDown={() => handleQuerySuggestionClick(org)}
                  style={{ cursor: 'pointer' }}
                >
                  {org.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Location Input with Suggestions */}
        <div className="col-md-4 position-relative">
          <label htmlFor="location-input" className="form-label fw-bold">Location</label>
          <input
            id="location-input"
            type="text"
            className="form-control"
            placeholder="e.g., 'New York', 'California'"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => location.length > 1 && setShowLocationSuggestions(true)}
          />
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
              {locationSuggestions.map((loc, index) => (
                <li
                  key={index}
                  className="list-group-item list-group-item-action"
                  onMouseDown={() => handleLocationSuggestionClick(loc)}
                  style={{ cursor: 'pointer' }}
                >
                  {loc}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Category Select */}
        <div className="col-md-3">
          <label htmlFor="category-select" className="form-label fw-bold">Category</label>
          <select
            id="category-select"
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.length > 1 ? (
              categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))
            ) : (
              <option>Loading...</option>
            )}
          </select>
        </div>
      </div>

      {/* Search Button */}
      <div className="text-center mb-4">
        <button className="btn btn-primary btn-lg" onClick={handleSearchClick} disabled={loading}>
          {loading ? 'Searching...' : 'Search Organizations'}
        </button>
      </div>

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-totoro" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {!initialLoad && results.length > 0 ? (
            results.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <OrganizationCard
                  organization={item}
                  onCardClick={() => handleSelectOrganization(item)}
                  onWebsiteClick={(url) => window.open(url, '_blank', 'noopener,noreferrer')}
                />
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center text-muted mt-5 p-4 bg-light rounded">
                <h4>{initialLoad ? "Start your search" : "No Results Found"}</h4>
                <p>{initialLoad ? "Use the filters above to find organizations." : "Try adjusting your search terms or filters."}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;