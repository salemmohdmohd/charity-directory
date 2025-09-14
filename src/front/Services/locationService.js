import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const locationService = {
  // Get all locations with organization counts
  async getAllLocations() {
    try {
      const response = await axios.get(`${API_BASE}/locations`);
      return {
        success: true,
        locations: response.data.locations
      };
    } catch (error) {
      console.error('Error fetching locations:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch locations'
      };
    }
  },

  // Search locations by query
  async searchLocations(query) {
    try {
      const response = await axios.get(`${API_BASE}/locations/search`, {
        params: { q: query }
      });
      return {
        success: true,
        locations: response.data.locations
      };
    } catch (error) {
      console.error('Error searching locations:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search locations'
      };
    }
  },

  // Get unique states from locations
  async getAvailableStates() {
    try {
      const response = await axios.get(`${API_BASE}/locations`);
      const locations = response.data.locations;

      // Extract unique states and their organization counts
      const stateMap = new Map();

      locations.forEach(location => {
        const state = location.state_province;
        if (state) {
          if (stateMap.has(state)) {
            stateMap.set(state, stateMap.get(state) + location.organization_count);
          } else {
            stateMap.set(state, location.organization_count);
          }
        }
      });

      const states = Array.from(stateMap.entries()).map(([state, count]) => ({
        state_province: state,
        organization_count: count
      })).sort((a, b) => a.state_province.localeCompare(b.state_province));

      return {
        success: true,
        states
      };
    } catch (error) {
      console.error('Error fetching states:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch states'
      };
    }
  },

  // Get locations for a specific state
  async getLocationsByState(state) {
    try {
      const response = await axios.get(`${API_BASE}/locations`);
      const locations = response.data.locations.filter(
        location => location.state_province === state
      );

      return {
        success: true,
        locations
      };
    } catch (error) {
      console.error('Error fetching locations by state:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch locations for state'
      };
    }
  }
};

export default locationService;
