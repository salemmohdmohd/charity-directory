import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';

const SearchHistory = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [searchHistory, setSearchHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!store.user) {
      navigate('/login');
      return;
    }

    // Load search history - in a real app, this would be an API call
    const loadSearchHistory = () => {
      // Mock search history data
      const mockHistory = [
        {
          id: 1,
          query: 'children education',
          type: 'charity_search',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          results: 12,
          category: 'Education'
        },
        {
          id: 2,
          query: 'ocean conservation',
          type: 'charity_search',
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          results: 8,
          category: 'Environment'
        },
        {
          id: 3,
          query: 'food bank near me',
          type: 'location_search',
          timestamp: new Date(Date.now() - 259200000), // 3 days ago
          results: 15,
          location: 'Fort Worth, TX'
        },
        {
          id: 4,
          query: 'health',
          type: 'category_search',
          timestamp: new Date(Date.now() - 345600000), // 4 days ago
          results: 23,
          category: 'Health'
        },
        {
          id: 5,
          query: 'animal shelter',
          type: 'charity_search',
          timestamp: new Date(Date.now() - 432000000), // 5 days ago
          results: 9,
          category: 'Animals'
        },
        {
          id: 6,
          query: 'disaster relief',
          type: 'charity_search',
          timestamp: new Date(Date.now() - 518400000), // 6 days ago
          results: 6,
          category: 'Disaster Relief'
        }
      ];
      
      setSearchHistory(mockHistory);
      setFilteredHistory(mockHistory);
    };

    loadSearchHistory();
  }, [store.user, navigate]);

  // Filter search history
  useEffect(() => {
    let filtered = searchHistory;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredHistory(filtered);
  }, [searchHistory, filterType, searchTerm]);

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getSearchIcon = (type) => {
    switch (type) {
      case 'charity_search': return 'bi-heart';
      case 'category_search': return 'bi-tags';
      case 'location_search': return 'bi-geo-alt';
      default: return 'bi-search';
    }
  };

  const getSearchTypeLabel = (type) => {
    switch (type) {
      case 'charity_search': return 'Charity Search';
      case 'category_search': return 'Category Search';
      case 'location_search': return 'Location Search';
      default: return 'Search';
    }
  };

  const handleRepeatSearch = (searchItem) => {
    // In a real app, this would trigger the actual search
    dispatch({ 
      type: 'SET_NOTIFICATION', 
      payload: `Repeating search for "${searchItem.query}"` 
    });
    // Navigate to search results or trigger search
    // navigate(`/search?q=${encodeURIComponent(searchItem.query)}&type=${searchItem.type}`);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire search history?')) {
      setSearchHistory([]);
      setFilteredHistory([]);
      dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: 'Search history cleared successfully' 
      });
    }
  };

  const handleDeleteSearch = (id) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id);
    setSearchHistory(updatedHistory);
    dispatch({ 
      type: 'SET_NOTIFICATION', 
      payload: 'Search item removed' 
    });
  };

  if (!store.user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-1">Search History</h1>
              <p className="text-muted mb-0">View and manage your recent searches</p>
            </div>
            <div>
              <Link to="/dashboard" className="btn btn-outline-secondary me-2">
                <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
              </Link>
              <button 
                className="btn btn-outline-danger"
                onClick={handleClearHistory}
                disabled={searchHistory.length === 0}
              >
                <i className="bi bi-trash me-2"></i>Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search your history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Search Types</option>
            <option value="charity_search">Charity Searches</option>
            <option value="category_search">Category Searches</option>
            <option value="location_search">Location Searches</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h3 className="mb-1">{searchHistory.length}</h3>
              <small>Total Searches</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h3 className="mb-1">{searchHistory.filter(s => s.type === 'charity_search').length}</h3>
              <small>Charity Searches</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h3 className="mb-1">{searchHistory.filter(s => s.type === 'category_search').length}</h3>
              <small>Category Searches</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h3 className="mb-1">{searchHistory.filter(s => s.type === 'location_search').length}</h3>
              <small>Location Searches</small>
            </div>
          </div>
        </div>
      </div>

      {/* Search History List */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Searches</h5>
              <small className="text-muted">
                Showing {filteredHistory.length} of {searchHistory.length} searches
              </small>
            </div>
            <div className="card-body p-0">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clock-history fs-1 text-muted mb-3 d-block"></i>
                  <h5 className="text-muted">No search history found</h5>
                  <p className="text-muted">
                    {searchHistory.length === 0 
                      ? "Start searching for charities to see your history here" 
                      : "Try adjusting your filters or search terms"}
                  </p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {filteredHistory.map((searchItem) => (
                    <div key={searchItem.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center flex-grow-1">
                          <div className="me-3">
                            <i className={`${getSearchIcon(searchItem.type)} fs-4 text-primary`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0">"{searchItem.query}"</h6>
                              <small className="text-muted">{formatDate(searchItem.timestamp)}</small>
                            </div>
                            <div className="d-flex align-items-center text-muted small">
                              <span className="badge bg-light text-dark me-2">
                                {getSearchTypeLabel(searchItem.type)}
                              </span>
                              {searchItem.category && (
                                <span className="me-3">
                                  <i className="bi bi-tag me-1"></i>
                                  {searchItem.category}
                                </span>
                              )}
                              {searchItem.location && (
                                <span className="me-3">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {searchItem.location}
                                </span>
                              )}
                              <span>
                                <i className="bi bi-search me-1"></i>
                                {searchItem.results} results
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2 ms-3">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleRepeatSearch(searchItem)}
                            title="Repeat this search"
                          >
                            <i className="bi bi-arrow-clockwise"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteSearch(searchItem.id)}
                            title="Remove from history"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHistory;
