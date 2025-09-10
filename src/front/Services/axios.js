import axios from 'axios'

// Use proxy-relative API path
const baseURL = '/api'

// Create axios instance with enhanced configuration
export const api = axios.create({
  baseURL,
  timeout: 10000, // Increased timeout for OAuth callbacks
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Token management utilities
const getAccessToken = () => localStorage.getItem('access_token')
const getRefreshToken = () => localStorage.getItem('refresh_token')
const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken)
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken)
  }
}
const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (expired tokens)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          // Attempt to refresh the access token
          const response = await axios.post(`${baseURL}/auth/refresh`, {}, {
            headers: {
              'Authorization': `Bearer ${refreshToken}`,
              'Content-Type': 'application/json'
            }
          })

          const { access_token } = response.data
          saveTokens(access_token, refreshToken)

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, redirect to login
          console.error('Token refresh failed:', refreshError)
          clearTokens()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, redirect to login
        clearTokens()
        window.location.href = '/login'
      }
    }

    // Handle other errors - extract specific error messages from backend
    if (error.response?.data?.message) {
      // Create a new error with the backend's specific message
      const enhancedError = new Error(error.response.data.message)
      enhancedError.response = error.response
      enhancedError.config = error.config
      enhancedError.code = error.code
      return Promise.reject(enhancedError)
    }

    return Promise.reject(error)
  }
)

// Auth service methods using axios
export const authService = {
  // Login with email/password
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { access_token, refresh_token, user } = response.data
    saveTokens(access_token, refresh_token)
    return { user, accessToken: access_token, refreshToken: refresh_token }
  },

  // Signup (backend uses /register endpoint)
  signup: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password })
    const { access_token, refresh_token, user, message } = response.data

    // Save tokens since user is now immediately active
    if (access_token && refresh_token) {
      saveTokens(access_token, refresh_token)
    }

    return { user, accessToken: access_token, refreshToken: refresh_token, message }
  },

  // Organization signup - creates both admin user and organization
  organizationSignup: async (organizationData) => {
    const response = await api.post('/org-signup', organizationData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    const { access_token, refresh_token, user, organization, message } = response.data;

    // Save tokens since user is now immediately active
    if (access_token && refresh_token) {
      saveTokens(access_token, refresh_token);
    }

    return { user, organization, accessToken: access_token, refreshToken: refresh_token, message };
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      clearTokens()
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getAccessToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch (error) {
      console.error('Token validation error:', error)
      clearTokens()
      return false
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, new_password: newPassword })
    return response.data
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    })
    return response.data
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },

  // Google OAuth initiation
  initiateGoogleOAuth: () => {
    window.location.href = `${baseURL}/auth/google`
  },

  // Link Google account
  linkGoogleAccount: async () => {
    // This typically involves redirecting to OAuth with linking parameter
    window.location.href = `${baseURL}/auth/google?link=true`
  },

  // Unlink Google account
  unlinkGoogleAccount: async () => {
    const response = await api.post('/auth/unlink-google')
    return response.data
  },

  // Handle OAuth callback (for URL parsing)
  handleOAuthCallback: (token, refreshToken, userId) => {
    saveTokens(token, refreshToken)
    return { token, refreshToken, userId }
  },

  // Debug token (for development)
  debugToken: async () => {
    const response = await api.post('/auth/debug-token')
    return response.data
  }
}

// Category service methods
export const categoryService = {
  // Get all categories, optionally including organizations and photos
  getCategories: async (includeOrgs = false) => {
    const params = new URLSearchParams();
    if (includeOrgs) {
      params.append('include_organizations', 'true');
      params.append('per_page', '3'); // Limit to 3 orgs per category
    }
    const response = await api.get(`/categories?${params}`);
    return response.data;
  },

  // Get organizations by category
  getOrganizationsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/categories/${categoryId}/organizations`, { params });
    return response.data;
  },

  // Get a single category by its slug, with optional params for pagination
  getCategoryBySlug: async (slug, params = {}) => {
    const response = await api.get(`/categories/slug/${slug}`, { params });
    return response.data;
  },
};

export const organizationService = {
  // Get all organizations
  getOrganizations: async (params = {}) => {
    const searchParams = new URLSearchParams(params)
    const response = await api.get(`/organizations?${searchParams}`)
    return response.data
  },

  // Search organizations (for suggestions)
    searchOrganizations: (query, limit = 10) => {
    return api.get(`/search/organizations?q=${query}&per_page=${limit}`);
  },

  // Get single organization
  getOrganization: async (orgId) => {
    const response = await api.get(`/organizations/${orgId}`)
    return response.data
  },

  // Get organization photos
  getOrganizationPhotos: async (orgId) => {
    const response = await api.get(`/organizations/${orgId}/photos`)
    return response.data
  },

  // Contact organization
  contactOrganization: async (orgId, contactData) => {
    const response = await api.post(`/organizations/${orgId}/contact`, contactData)
    return response.data
  },

  // Advanced search for organizations
  advancedSearch: (params) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/search/organizations/advanced?${searchParams}`);
  },

  // Get location suggestions for search
  getLocationSuggestions: (query) => {
    return api.get(`/search/locations?q=${query}`);
  },
}

// User service methods
export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Get user bookmarks
  getBookmarks: async () => {
    const response = await api.get('/users/bookmarks');
    return response.data.bookmarks || [];
  },

  // Add a bookmark
  addBookmark: async (organizationId) => {
    const response = await api.post('/users/bookmarks', { organization_id: organizationId });
    return response.data;
  },

  // Remove a bookmark
  removeBookmark: async (bookmarkId) => {
    const response = await api.delete(`/users/bookmarks/${bookmarkId}`);
    return response.data;
  },
};

// Notification service methods
export const notificationService = {
  // Get notification preferences
  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },

  // Get notifications with pagination
  getNotifications: async (page = 1, perPage = 20) => {
    const response = await api.get('/notifications', { params: { page, per_page: perPage } });
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },
};

// Advertisement service methods
export const advertisementService = {
  // Get advertisements by placement
  getAdvertisements: async (placement) => {
    const response = await api.get('/advertisements', { params: { placement } });
    return response.data.advertisements || [];
  },
};

// Search service methods
export const searchService = {
  // Get search suggestions
  getSuggestions: async (query) => {
    const response = await api.get('/search/suggestions', { params: { q: query } });
    return response.data.suggestions || [];
  },

  // Get popular searches
  getPopularSearches: async () => {
    const response = await api.get('/search/popular');
    return response.data.popular_searches || [];
  },
};

// File Upload service methods
export const fileUploadService = {
  // Upload a file
  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },
};

// Export the configured axios instance as default
export default api
