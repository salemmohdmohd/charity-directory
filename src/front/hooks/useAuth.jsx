import { useCallback } from 'react';
import useGlobalReducer from '../hooks/useGlobalReducer';
import * as authAPI from '../data/userAuth';

/**
 * Enhanced authentication hook that integrates userAuth functions with global state management
 * This hook provides a unified interface for authentication while automatically updating global state
 */
export const useAuth = () => {
  const { store, dispatch } = useGlobalReducer();

  // Initialize auth state from token if available
  const initializeAuth = useCallback(async () => {
    try {
      // First check if we have a token and it's not expired
      if (authAPI.isAuthenticated()) {
        try {
          const userData = await authAPI.getCurrentUserData();
          dispatch({ type: 'SET_USER', payload: userData.user });
        } catch (error) {
          // Token exists but API call failed (expired, invalid, etc.)
          console.warn('Token validation failed, clearing auth state:', error);
          authAPI.removeToken();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // No valid token found
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: 'LOGOUT' });
      authAPI.removeToken();
    }
  }, [dispatch]);

  // Enhanced login function that updates global state
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const data = await authAPI.login(email, password);

      dispatch({ type: 'SET_USER', payload: data.user });
      dispatch({ type: 'SET_NOTIFICATION', payload: 'Welcome back!' });

      return data;
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [dispatch]);

  // Enhanced signup function that updates global state
  const signup = useCallback(async (name, email, password) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const data = await authAPI.signup(name, email, password);

      // Since users are now active by default, set them as authenticated
      dispatch({ type: 'SET_USER', payload: data.user });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: 'Account created successfully! Welcome to Charity Directory!'
      });

      return data;
    } catch (error) {
      const errorMessage = error.message || 'Signup failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [dispatch]);

  // Organization signup function
  const organizationSignup = useCallback(async (organizationData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const data = await authAPI.organizationSignup(organizationData);

      // Set user as authenticated (org admin)
      dispatch({ type: 'SET_USER', payload: data.user });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: 'Organization registration successful! Your application is pending approval.'
      });

      return data;
    } catch (error) {
      const errorMessage = error.message || 'Organization registration failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [dispatch]);

  // Enhanced logout function that updates global state
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'SET_NOTIFICATION', payload: 'Logged out successfully!' });
    } catch (error) {
      console.error('Logout error:', error);
      // Still log out locally even if API call fails
      dispatch({ type: 'LOGOUT' });
    }
  }, [dispatch]);

  // Google OAuth with global state integration
  const initiateGoogleOAuth = useCallback(() => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      authAPI.initiateGoogleOAuth();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize Google login. Please try again.' });
    }
  }, [dispatch]);

  // Link Google account
  const linkGoogleAccount = useCallback(async () => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await authAPI.linkGoogleAccount();
    } catch (error) {
      const errorMessage = error.message || 'Failed to link Google account.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [dispatch]);

  // Unlink Google account
  const unlinkGoogleAccount = useCallback(async () => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const data = await authAPI.unlinkGoogleAccount();

      dispatch({ type: 'SET_NOTIFICATION', payload: 'Google account unlinked successfully!' });
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Failed to unlink Google account.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [dispatch]);

  // Password reset functions
  const forgotPassword = useCallback(async (email) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await authAPI.forgotPassword(email);

      dispatch({
        type: 'SET_NOTIFICATION',
        payload: 'If an account with this email exists, we\'ve sent password reset instructions.'
      });
    } catch (error) {
      const errorMessage = error.message || 'Failed to send reset email.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [dispatch]);

  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await authAPI.resetPassword(token, newPassword);

      dispatch({ type: 'SET_NOTIFICATION', payload: 'Password reset successfully! You can now log in.' });
    } catch (error) {
      const errorMessage = error.message || 'Failed to reset password.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [dispatch]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await authAPI.changePassword(currentPassword, newPassword);

      dispatch({ type: 'SET_NOTIFICATION', payload: 'Password changed successfully!' });
    } catch (error) {
      const errorMessage = error.message || 'Failed to change password.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [dispatch]);

  // Update user profile
  const updateUserProfile = useCallback(async (userData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      // Assuming we have an updateProfile function in userAuth
      const updatedUser = await authAPI.updateProfile(userData);

      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'SET_NOTIFICATION', payload: 'Profile updated successfully!' });

      return updatedUser;
    } catch (error) {
      const errorMessage = error.message || 'Failed to update profile.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [dispatch]);

  // Clear notifications and errors
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  const clearNotification = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATION' });
  }, [dispatch]);

  // Return all auth functions and state
  return {
    // State from global store
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    error: store.error,
    notification: store.notification,

    // Authentication functions
    login,
    signup,
    organizationSignup,
    logout,
    initializeAuth,

    // Google OAuth functions
    initiateGoogleOAuth,
    linkGoogleAccount,
    unlinkGoogleAccount,

    // Password management
    forgotPassword,
    resetPassword,
    changePassword,

    // Profile management
    updateUserProfile,

    // Utility functions
    clearError,
    clearNotification,

    // Direct access to low-level auth functions (if needed)
    isTokenValid: authAPI.isAuthenticated,
    getCurrentUserFromToken: authAPI.getCurrentUser,
  };
};

export default useAuth;
