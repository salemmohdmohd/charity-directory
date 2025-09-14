import { useState, useEffect, useCallback } from 'react';
import { organizationService } from '../Services/axios';
import useGlobalReducer from './useGlobalReducer';

export const useOrganizations = (initialParams = {}) => {
  const { store, dispatch } = useGlobalReducer();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchOrganizations = useCallback(async (fetchParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const finalParams = { ...params, ...fetchParams };

      // Add location filter if selected (with safety check)
      if (store?.selectedLocation?.type === 'state') {
        finalParams.state_province = store.selectedLocation.state_province;
      }

      const response = await organizationService.getOrganizations(finalParams);

      setOrganizations(response.organizations || []);
      setPagination(response.pagination || null);

      // Update global store
      dispatch({
        type: 'SET_ORGANIZATIONS',
        payload: response.organizations || []
      });

    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(err.message || 'Failed to fetch organizations');
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'Failed to fetch organizations'
      });
    } finally {
      setLoading(false);
    }
  }, [params, store?.selectedLocation, dispatch]);  // Listen for location changes
  useEffect(() => {
    const handleLocationChange = (event) => {
      const locationData = event.detail;
      // Refetch organizations when location changes
      fetchOrganizations();
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, [fetchOrganizations]);

  // Initial fetch
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const refetch = useCallback((additionalParams = {}) => {
    return fetchOrganizations(additionalParams);
  }, [fetchOrganizations]);

  return {
    organizations,
    loading,
    error,
    pagination,
    params,
    updateParams,
    refetch,
    selectedLocation: store?.selectedLocation || null
  };
};

export default useOrganizations;
