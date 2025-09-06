import React, { useState, useEffect } from 'react';
import useGlobalReducer from '../hooks/useGlobalReducer';

// Function to get representative images for each category
const getCategoryImage = (categoryName) => {
  const imageMap = {
    'Healthcare': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop',
    'Education': 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=300&h=200&fit=crop',
    'Environment': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
    'Animal Welfare': 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=200&fit=crop',
    'Human Rights': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop',
    'Poverty Relief': 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&h=200&fit=crop',
    'Disaster Relief': 'https://images.unsplash.com/photo-1593113616828-6f22bfa8dd81?w=300&h=200&fit=crop',
    'Arts & Culture': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop',
    'Youth Development': 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=300&h=200&fit=crop',
    'Senior Services': 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=300&h=200&fit=crop'
  };
  return imageMap[categoryName] || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300&h=200&fit=crop';
};

// Reusable Filter Component
const FilterSection = ({ title, items, selectedItem, onItemSelect, type }) => {
  return (
    <div className="mb-4">
      <h5 className="mb-3 text-forest">{title}</h5>
      <div className="row g-2">
        <div className="col-auto">
          <button
            className={`calcifer-button btn ${selectedItem === 'all' ? 'btn-primary' : 'btn-outline-secondary'} btn-sm`}
            onClick={() => onItemSelect('all', type)}
          >
            All {title}
          </button>
        </div>
        {items.map((item) => (
          <div key={item.id} className="col-auto">
            <button
              className={`btn ${selectedItem === item.name ? 'btn-primary' : 'btn-outline-secondary'} btn-sm glow-soft`}
              onClick={() => onItemSelect(item.name, type)}
              style={{ backgroundColor: selectedItem === item.name ? item.color_code : '', borderColor: item.color_code }}
            >
              {item.name} ({item.organization_count})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Category Card Component - Enhanced with Ghibli styling
const CategoryCard = ({ category, onCardClick }) => {
  return (
    <div className="col-md-6 col-lg-4">
      <div 
        className="totoro-card magic-shimmer"
        style={{ cursor: 'pointer', borderLeft: `4px solid ${category.color_code}` }}
        onClick={() => onCardClick(category)}
      >
        <img 
          src={getCategoryImage(category.name)} 
          className="card-img-top" 
          alt={category.name}
          style={{ height: '300px', objectFit: 'cover', borderRadius: '1rem 1rem 0 0' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* <div 
          className="card-img-top d-flex justify-content-center align-items-center glow-forest"
          style={{ 
            height: '150px', 
            backgroundColor: category.color_code,
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'none',
            borderRadius: '1rem 1rem 0 0'
          }}
        >
          {category.name}
        </div> */}
        <div className="card-body">
          <h5 className="card-title text-forest fw-bold" style={{ color: category.color_code }}>
            {category.name}
          </h5>
          <p className="card-text text-muted">{category.description}</p>
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <small className="text-muted">Organizations:</small>
            <span className="badge glow-soft" style={{ backgroundColor: category.color_code, color: 'white' }}>
              {category.organization_count}
            </span>
          </div>
          
          <button className="calcifer-button btn btn-outline-primary btn-sm w-100">
            View Organizations
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Charity Card Component with Ghibli magic (no floating)
const CharityCard = ({ charity, onCardClick }) => {
  return (
    <div className="col-md-6 col-lg-4">
      <div 
        className="totoro-card h-100"
        style={{ cursor: 'pointer' }}
        onClick={() => onCardClick(charity)}
      >
        <img 
          src={charity.image} 
          className="card-img-top" 
          alt={charity.name}
          style={{ height: '200px', objectFit: 'cover', borderRadius: '1rem 1rem 0 0' }}
        />
        <div className="card-body">
          <h6 className="card-title text-forest fw-bold">{charity.name}</h6>
          <p className="card-text small text-muted">{charity.description}</p>
          
          <div className="d-flex justify-content-between mb-2">
            <small className="text-muted">Category:</small>
            <span className="badge bg-totoro glow-soft">{charity.category}</span>
          </div>
          
          <div className="d-flex justify-content-between mb-2">
            <small className="text-muted">Location:</small>
            <small className="text-forest fw-bold">{charity.location}</small>
          </div>
          
          <div className="d-flex justify-content-between mb-3">
            <small className="text-muted">Impact:</small>
            <span className={`badge glow-soft ${charity.impact === 'High' ? 'bg-forest' : charity.impact === 'Medium' ? 'bg-sunset' : 'bg-sky'}`}>
              {charity.impact}
            </span>
          </div>
          
          <button className="calcifer-button btn btn-outline-primary btn-sm w-100">
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
  const [categories, setCategories] = useState([]); // Real categories from backend
  const [charities, setCharities] = useState([]);
  const [filteredCharities, setFilteredCharities] = useState([]);
  const [viewMode, setViewMode] = useState('categories'); // Toggle between categories and charities view
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCause, setSelectedCause] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');

  // Function to fetch categories from your backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5000/api/categories');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data.categories);
      setLoading(false);
      
      console.log('Categories loaded:', data.categories); // For debugging
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
      
      // You can dispatch an error notification
      dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: 'Failed to load categories. Please try again.' 
      });
    }
  };

  // Mock data for charities (you can replace this with another API call later)
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
      category: "Poverty Relief",
      location: "New York",
      cause: "Hunger Relief",
      impact: "Medium",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      name: "Mental Health Support Network",
      description: "Providing mental health services",
      category: "Healthcare",
      location: "Florida",
      cause: "Healthcare",
      impact: "Medium",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop"
    },
    {
      id: 5,
      name: "Animal Rescue Center",
      description: "Rescuing and caring for abandoned animals",
      category: "Animal Welfare",
      location: "California",
      cause: "Animal Welfare",
      impact: "Medium",
      image: "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=250&fit=crop"
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

  // Load categories from backend when component mounts
  useEffect(() => {
    fetchCategories();
    
    // Load mock charities (later you can replace this with another API call)
    setTimeout(() => {
      setCharities(mockCharities);
      setFilteredCharities(mockCharities);
    }, 500);
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

  const handleCardClick = (item) => {
    dispatch({ 
      type: 'SET_NOTIFICATION', 
      payload: `Viewing details for ${item.name}` 
    });
  };

  const handleCategoryClick = (category) => {
    // When a category is clicked, filter charities by that category and switch to charities view
    setSelectedCategory(category.name);
    setViewMode('charities');
    dispatch({ 
      type: 'SET_NOTIFICATION', 
      payload: `Viewing organizations in ${category.name}` 
    });
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="container py-6 text-center">
          <div className="forest-spinner mx-auto mb-4"></div>
          <p className="text-cream magical-message fs-5">Loading categories from the magical realm...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Ghibli Magic */}
      <section className="hero-ghibli forest-section py-7">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h1 className="magical-title hero-text-shadow display-4 fw-bold mb-3 float-magic">
                {viewMode === 'categories' ? 'Charity Categories' : 'Organizations'}
              </h1>
              <p className="enchanted-text subtitle-shadow lead">
                {viewMode === 'categories' 
                  ? 'Discover causes that matter to you in our magical world of giving' 
                  : 'Find organizations making a difference across the lands'
                }
              </p>
              
              {/* View Toggle Buttons with Ghibli styling */}
              <div className="mt-4">
                <button 
                  className={`calcifer-button btn me-3 ${viewMode === 'categories' ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => setViewMode('categories')}
                >
                  Browse Categories
                </button>
                <button 
                  className={`calcifer-button btn ${viewMode === 'charities' ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => setViewMode('charities')}
                >
                  View Organizations
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Ghibli styling */}
      <div className="container py-6">
        
        {/* Categories View with magical theming */}
        {viewMode === 'categories' && (
          <div className="meadow-section py-6" style={{ borderRadius: '2rem', margin: '2rem 0' }}>
            <div className="text-center mb-5">
              <h2 className="text-forest magical-title">Browse by Category</h2>
              <p className="text-muted enchanted-text">Choose a category to explore organizations in our magical realm</p>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-5 error-state" style={{ borderRadius: '1rem' }}>
                <i className="bi bi-exclamation-circle fs-1 text-calcifer"></i>
                <h5 className="text-muted mt-3">No categories available</h5>
                <p className="text-muted">Please try again later</p>
                <button 
                  className="calcifer-button btn btn-primary"
                  onClick={fetchCategories}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onCardClick={handleCategoryClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Charities View with Ghibli styling */}
        {viewMode === 'charities' && (
          <div className="row">
            <div className="col-lg-3">
              <div className="totoro-card glow-soft">
                <div className="card-header bg-totoro text-cream">
                  <h5 className="mb-0 text-cream">Filter Organizations</h5>
                </div>
                <div className="card-body bg-cream">
                  <FilterSection
                    title="Categories"
                    items={categories.map(cat => ({
                      id: cat.id,
                      name: cat.name,
                      organization_count: cat.organization_count,
                      color_code: cat.color_code
                    }))}
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

            {/* Results Section with magical styling */}
            <div className="col-lg-9">
              <div className="d-flex justify-content-between align-items-center mb-4 p-3 meadow-section organic-shape">
                <h4 className="text-forest magical-title">Organizations ({filteredCharities.length})</h4>
                <div>
                  <small className="text-muted">
                    Showing {filteredCharities.length} of {charities.length} organizations
                  </small>
                </div>
              </div>

              {filteredCharities.length === 0 ? (
                <div className="text-center py-6 info-state glow-soft" style={{ borderRadius: '2rem' }}>
                  <i className="bi bi-search fs-1 text-sky"></i>
                  <h5 className="text-muted mt-3">No organizations found in this realm</h5>
                  <p className="text-muted">Try adjusting your magical filters</p>
                  <button 
                    className="calcifer-button btn btn-primary"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedLocation('all');
                      setSelectedCause('all');
                      setSelectedImpact('all');
                    }}
                  >
                    Reset Magic Filters
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
        )}
      </div>
    </div>
  );
};

export default Categories;