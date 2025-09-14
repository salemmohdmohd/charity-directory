import React, { useState, useEffect, useRef } from 'react';
import useGlobalReducer from '../hooks/useGlobalReducer';
import locationService from '../Services/locationService';

const LocationSelector = () => {
  const { store, dispatch } = useGlobalReducer();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load available states on component mount
    loadStates();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStates = async () => {
    setLoading(true);
    try {
      const response = await locationService.getAvailableStates();
      if (response.success && dispatch) {
        dispatch({
          type: 'SET_AVAILABLE_STATES',
          payload: response.states
        });
      }
    } catch (error) {
      console.error('Error loading states:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateSelect = async (stateData) => {
    if (dispatch) {
      dispatch({
        type: 'SET_SELECTED_LOCATION',
        payload: {
          type: 'state',
          state_province: stateData.state_province,
          organization_count: stateData.organization_count
        }
      });
    }
    setIsOpen(false);

    // Trigger organization refetch with location filter
    window.dispatchEvent(new CustomEvent('locationChanged', {
      detail: {
        type: 'state',
        state_province: stateData.state_province
      }
    }));
  };

  const handleClearLocation = () => {
    if (dispatch) {
      dispatch({
        type: 'CLEAR_LOCATION_FILTER'
      });
    }
    setIsOpen(false);

    // Trigger organization refetch without location filter
    window.dispatchEvent(new CustomEvent('locationChanged', {
      detail: null
    }));
  };  const { selectedLocation, availableStates } = store || {};

  return (
    <div className="nav-item dropdown me-3" ref={dropdownRef}>
      <button
        className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        style={{
          minWidth: '140px',
          border: selectedLocation ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.3)',
          backgroundColor: selectedLocation ? 'rgba(255,215,0,0.1)' : 'transparent'
        }}
      >
        <i className="fas fa-map-marker-alt me-2" aria-hidden="true"></i>
        <span className="text-truncate">
          {selectedLocation
            ? selectedLocation.state_province
            : 'All States'
          }
        </span>
      </button>

      {isOpen && (
        <div className="dropdown-menu dropdown-menu-end show bg-cream border-forest" style={{ minWidth: '280px', maxHeight: '400px', overflowY: 'auto' }}>
          <div className="dropdown-header text-forest fw-bold">
            <i className="fas fa-map-marker-alt me-2"></i>
            Filter by Location
          </div>

          {selectedLocation && (
            <>
              <button
                className="dropdown-item text-forest d-flex align-items-center"
                onClick={handleClearLocation}
              >
                <i className="fas fa-times-circle me-2 text-calcifer"></i>
                <span>Clear Filter</span>
                <small className="ms-auto text-muted">Show All</small>
              </button>
              <div className="dropdown-divider border-meadow"></div>
            </>
          )}

          {loading ? (
            <div className="dropdown-item-text text-center">
              <div className="spinner-border spinner-border-sm text-totoro" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <small className="d-block mt-1 text-muted">Loading states...</small>
            </div>
          ) : (availableStates || []).length > 0 ? (
            <>
              <div className="dropdown-header text-muted small">
                Select a state to filter organizations
              </div>
              {(availableStates || []).map((stateData) => (
                <button
                  key={stateData.state_province}
                  className={`dropdown-item text-forest d-flex align-items-center ${
                    selectedLocation?.state_province === stateData.state_province ? 'active' : ''
                  }`}
                  onClick={() => handleStateSelect(stateData)}
                >
                  <i className="fas fa-map-pin me-2 text-totoro"></i>
                  <span className="flex-grow-1">{stateData.state_province}</span>
                  <small className="text-muted">
                    {stateData.organization_count} org{stateData.organization_count !== 1 ? 's' : ''}
                  </small>
                </button>
              ))}
            </>
          ) : (
            <div className="dropdown-item-text text-center text-muted">
              <i className="fas fa-exclamation-circle me-2"></i>
              No states available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
