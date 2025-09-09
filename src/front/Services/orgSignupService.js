import { api } from './axios';

// Service for organization signup-related API calls
export const orgSignupService = {
  /**
   * Fetches a simplified list of categories for the signup form.
   * This dedicated endpoint is optimized for performance.
   * @returns {Promise<Array>} A promise that resolves to an array of categories.
   */
  getCategories: async () => {
    try {
      const response = await api.get('/org-signup/categories');
      // Ensure we return the nested array, or an empty array on failure
      return response.data.categories || [];
    } catch (error) {
      console.error('Error fetching categories for org signup:', error);
      // Return an empty array to prevent component errors
      return [];
    }
  },
};
