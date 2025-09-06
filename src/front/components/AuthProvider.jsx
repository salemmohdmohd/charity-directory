import React, { useEffect } from 'react';
import useAuth from '../hooks/useAuth';

/**
 * AuthProvider component that initializes authentication state when the app loads
 * This component should wrap the main App component to ensure auth state is properly initialized
 */
export const AuthProvider = ({ children }) => {
  const { initializeAuth, isAuthenticated } = useAuth();

  useEffect(() => {
    // Initialize authentication state on app load
    initializeAuth();
  }, [initializeAuth]);

  // You could add a loading state here if needed
  return <>{children}</>;
};

export default AuthProvider;
