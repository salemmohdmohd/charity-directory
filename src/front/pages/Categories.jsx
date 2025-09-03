import React, { useState, useEffect } from 'react';
import useGlobalReducer from '../hooks/useGlobalReducer';

// Reusable Filter Component
const FilterSection = ({ title, items, selectedItem, onItemSelect, type }) => {
  return (
    <div className="mb-4">
      <h5 className="mb-3">{title}</h5>
      <div className="row g-2">
        <div className="col-auto">
          <button
            className={`btn ${selectedItem === 'all' ? 'btn-primary' : 'btn-outline-secondary'} btn-sm`}
            onClick={() => onItemSelect('all', type)}
          >
            All {title}
          </button>
        </div>
        {items.map((item) => (
          <div key={item.id} className="col-auto">
            <button
              className={`btn ${selectedItem === item.name ? 'btn-primary' : 'btn-outline-secondary'} btn-sm`}
              onClick={() => onItemSelect(item.name, type)}
            >
              {item.name} ({item.count})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Reusable Card Component
const CharityCard = ({ charity, onCardClick }) => {
  return (
    <div className="col-md-6 col-lg-4">
      <div 
        className="card h-100 shadow-sm"
        style={{ cursor: 'pointer' }}
        onClick={() => onCardClick(charity)}
      >
        <img 
          src={charity.image} 
          className="card-img-top" 
          alt={charity.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <div className="card-body">
          <h6 className="card-title">{charity.name}</h6>
          <p className="card-text small text-muted">{charity.description}</p>
          
          <div className="d-flex justify-content-between mb-2">
            <small className="text-muted">Category:</small>
            <span className="badge bg-primary">{charity.category}</span>
          </div>
          
          <div className="d-flex justify-content-between mb-2">
            <small className="text-muted">Location:</small>
            <small>{charity.location}</small>
          </div>
          
          <div className="d-flex justify-content-between mb-2">
            <small className="text-muted">Impact:</small>
            <span className={`badge bg-${charity.impact === 'High' ? 'success' : charity.impact === 'Medium' ? 'warning' : 'info'}`}>
              {charity.impact}
            </span>
          </div>
          
          <button className="btn btn-outline-primary btn-sm w-100 mt-2">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

const Categories = () => {
  const { store, dispatch } = useGlobalReducer();
  const [loading, setLoading] = useState(true);
  const [charities, setCharities] = useState([]);
  const [filteredCharities, setFilteredCharities] = useState([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCause, setSelectedCause] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');

  // Mock data
  const mockCharities = [
    {
      id: 1,
      name: "Ocean Conservation Fund",
      description: "Protecting marine ecosystems worldwide",
      category: "Environment",
      location: "California",
      cause: "Conservation",
      impact: "High",
      image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      name: "Children's Education Initiative",
      description: "Providing education to underprivileged children",
      category: "Education",
      location: "Texas",
      cause: "Education Access",
      impact: "High",
      image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      name: "Community Food Bank",
      description: "Fighting hunger in local communities",
      category: "Poverty",
      location: "New York",
      cause: "Hunger Relief",
      impact: "Medium",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      name: "Mental Health Support Network",
      description: "Providing mental health services",
      category: "Health",
      location: "Florida",
      cause: "Healthcare",
      impact: "Medium",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop"
    },
    {
      id: 5,
      name: "Animal Rescue Center",
      description: "Rescuing and caring for abandoned animals",
      category: "Animals",
      location: "California",
      cause: "Animal Welfare",
      impact: "Medium",
      image: "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=250&fit=crop"
    },
    {
      id: 6,
      name: "Disaster Relief Foundation",
      description: "Emergency response and disaster recovery",
      category: "Emergency",
      location: "Texas",
      cause: "Emergency Response",
      impact: "High",
      image: "https://images.unsplash.com/photo-1593113616828-6f22bfa8dd81?w=400&h=250&fit=crop"
    }
  ];

  // Generate filter options from data
  const getFilterOptions = (field) => {
    const items = [...new Set(charities.map(charity => charity[field]))];
    return items.map(item => ({
      id: item,
      name: item,
      count: charities.filter(charity => charity[field] === item).length
    }));
  };

  useEffect(() => {
    // Load data
    const loadData = () => {
      setTimeout(() => {
        setCharities(mockCharities);
        setFilteredCharities(mockCharities);
        setLoading(false);
      }, 1000);
    };
    loadData();
  }, []);

  // Filter charities based on selected filters
  useEffect(() => {
    let filtered = charities;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(charity => charity.category === selectedCategory);
    }
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(charity => charity.location === selectedLocation);
    }
    if (selectedCause !== 'all') {
      filtered = filtered.filter(charity => charity.cause === selectedCause);
    }
    if (selectedImpact !== 'all') {
      filtered = filtered.filter(charity => charity.impact === selectedImpact);
    }

    setFilteredCharities(filtered);
  }, [selectedCategory, selectedLocation, selectedCause, selectedImpact, charities]);

  const handleFilterSelect = (value, type) => {
    switch (type) {
      case 'Categories':
        setSelectedCategory(value);
        break;
      case 'Locations':
        setSelectedLocation(value);
        break;
      case 'Causes':
        setSelectedCause(value);
        break;
      case 'Impact Levels':
        setSelectedImpact(value);
        break;
      default:
        break;
    }
  };

  const handleCardClick = (charity) => {
    dispatch({ 
      type: 'SET_NOTIFICATION', 
      payload: `Viewing details for ${charity.name}` 
    });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading charities...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Your existing header */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h1 className="display-4 fw-bold mb-3">List of our categories</h1>
              <p className="lead">
                Unseen.com Connecting generous hearts with meaningful causes worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-5">
        {/* Filters Section */}
        <div className="row">
          <div className="col-lg-3">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Filter Charities</h5>
              </div>
              <div className="card-body">
                <FilterSection
                  title="Categories"
                  items={getFilterOptions('category')}
                  selectedItem={selectedCategory}
                  onItemSelect={handleFilterSelect}
                  type="Categories"
                />
                
                <FilterSection
                  title="Locations"
                  items={getFilterOptions('location')}
                  selectedItem={selectedLocation}
                  onItemSelect={handleFilterSelect}
                  type="Locations"
                />
                
                <FilterSection
                  title="Causes"
                  items={getFilterOptions('cause')}
                  selectedItem={selectedCause}
                  onItemSelect={handleFilterSelect}
                  type="Causes"
                />
                
                <FilterSection
                  title="Impact Levels"
                  items={getFilterOptions('impact')}
                  selectedItem={selectedImpact}
                  onItemSelect={handleFilterSelect}
                  type="Impact Levels"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>Charities ({filteredCharities.length})</h4>
              <div>
                <small className="text-muted">
                  Showing {filteredCharities.length} of {charities.length} charities
                </small>
              </div>
            </div>

            {filteredCharities.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search fs-1 text-muted"></i>
                <h5 className="text-muted mt-3">No charities found</h5>
                <p className="text-muted">Try adjusting your filters</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLocation('all');
                    setSelectedCause('all');
                    setSelectedImpact('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredCharities.map((charity) => (
                  <CharityCard
                    key={charity.id}
                    charity={charity}
                    onCardClick={handleCardClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
