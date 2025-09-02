import React from 'react';
import useGlobalReducer from '../hooks/useGlobalReducer';

/**
 * Global Error Alert
 */
const ErrorAlert = () => {
  const { store, dispatch } = useGlobalReducer();

  if (!store.error) {
    return null;
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <div className="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error:</strong> {store.error}
      <button
        type="button"
        className="btn-close"
        onClick={clearError}
      ></button>
    </div>
  );
};

/**
 * Global Notification Alert
 */
const NotificationAlert = () => {
  const { store, dispatch } = useGlobalReducer();

  if (!store.notification) {
    return null;
  }

  const clearNotification = () => {
    dispatch({ type: 'SET_NOTIFICATION', payload: null });
  };

  return (
    <div className="alert alert-success alert-dismissible fade show" role="alert">
      {store.notification}
      <button
        type="button"
        className="btn-close"
        onClick={clearNotification}
      ></button>
    </div>
  );
};

/**
 * Simple Error Boundary
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger text-center">
          <h4>Something went wrong</h4>
          <p>Please refresh the page and try again.</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple Error Page Component
 */
const ErrorPage = ({
  title = '500 - Server Error',
  message = 'Sorry, something went wrong.',
  onGoHome,
  className = ''
}) => {
  return (
    <div className={`d-flex flex-column justify-content-center align-items-center min-vh-100 text-center ${className}`}>
      <h1 className="display-4 mb-3">{title}</h1>
      <p className="lead mb-4">{message}</p>
      {onGoHome && (
        <button className="btn btn-primary btn-lg" onClick={onGoHome}>
          Go Home
        </button>
      )}
    </div>
  );
};

/**
 * Simple 404 Not Found Component
 */
const NotFound = ({
  title = '404 - Page Not Found',
  message = 'The page you are looking for does not exist.',
  onGoHome,
  className = ''
}) => {
  return (
    <div className={`d-flex flex-column justify-content-center align-items-center min-vh-100 text-center ${className}`}>
      <h1 className="display-1 mb-3">404</h1>
      <h2 className="mb-3">{title}</h2>
      <p className="lead mb-4">{message}</p>
      {onGoHome && (
        <button className="btn btn-primary btn-lg" onClick={onGoHome}>
          Go Home
        </button>
      )}
    </div>
  );
};

export { ErrorAlert, NotificationAlert, ErrorBoundary, ErrorPage, NotFound };