// src/front/data/userAuth.jsx

import { authService, userService } from '../Services/axios';

// --- Re-exporting authService methods for backward compatibility ---
export const login = authService.login;
export const signup = authService.signup;
export const organizationSignup = authService.organizationSignup;
export const logout = authService.logout;
export const isAuthenticated = authService.isAuthenticated;
export const forgotPassword = authService.forgotPassword;
export const resetPassword = authService.resetPassword;
export const changePassword = authService.changePassword;
export const initiateGoogleOAuth = authService.initiateGoogleOAuth;
export const linkGoogleAccount = authService.linkGoogleAccount;
export const unlinkGoogleAccount = authService.unlinkGoogleAccount;
export const debugToken = authService.debugToken;

// --- Re-exporting userService methods ---
export const updateProfile = userService.updateProfile;
export const getProfile = userService.getProfile;
export const getBookmarks = userService.getBookmarks;
export const addBookmark = userService.addBookmark;
export const removeBookmark = userService.removeBookmark;

// --- Enhanced/Compatibility Functions ---

/**
 * Fetches current user data and maintains compatibility with components
 * expecting a { user: ... } structure.
 */
export const getCurrentUserData = async () => {
  const userData = await authService.getCurrentUser();
  return { user: userData }; // Maintain compatibility
};

/**
 * Handles OAuth callback by extracting tokens from URL and saving them.
 * @param {URLSearchParams} urlParams - The URL search parameters.
 * @returns {Object} The tokens and user ID.
 */
export const handleOAuthCallback = (urlParams) => {
  const token = urlParams.get('token');
  const refreshToken = urlParams.get('refresh_token');
  const userId = urlParams.get('user_id');

  if (token) {
    authService.handleOAuthCallback(token, refreshToken, userId);
    return { token, refreshToken, userId };
  }

  throw new Error('No authentication tokens received');
};

/**
 * Decodes the JWT to get user information without a server request.
 * @returns {Object|null} The user object or null if token is invalid.
 */
export const getCurrentUser = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Ensure token is not expired
    if (payload.exp * 1000 < Date.now()) {
      authService.logout(); // Use the service to clear tokens
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      is_verified: payload.is_verified,
    };
  } catch (error) {
    console.error('Token validation error:', error);
    authService.logout(); // Use the service to clear tokens
    return null;
  }
};

// --- Deprecated Token Functions (kept for reference, but service should be used) ---

export const getToken = () => localStorage.getItem('access_token');

export const saveToken = (token) => {
  console.warn("`saveToken` is deprecated. Use `authService.login` or other service methods.");
  localStorage.setItem('access_token', token);
};

export const removeToken = () => {
  console.warn("`removeToken` is deprecated. Use `authService.logout`.");
  authService.logout();
};

