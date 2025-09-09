import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireUnauth = false,
  allowedRoles = [], // New: array of allowed roles
  redirectTo = null   // New: custom redirect path
}) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  console.log('ProtectedRoute Check:', {
    pathname: location.pathname,
    isAuthenticated,
    userRole: user?.role
  });

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If route requires user to be unauthenticated (like login/signup) and user is authenticated
  if (requireUnauth && isAuthenticated) {
    // Redirect based on user role
    if (user?.role === 'org_admin') {
      return <Navigate to="/organization-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Role-based access control
  if (requireAuth && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // If custom redirect is specified, use it
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Otherwise, redirect to appropriate dashboard based on role
    if (user?.role === 'org_admin') {
      return <Navigate to="/organization-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
