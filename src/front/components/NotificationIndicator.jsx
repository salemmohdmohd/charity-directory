import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUnreadCount } from '../data/notificationAuth';
import useGlobalReducer from '../hooks/useGlobalReducer';

export const NotificationIndicator = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useGlobalReducer();

  useEffect(() => {
    if (state && state.user && state.user.id) {
      loadUnreadCount();

      // Set up polling for real-time updates every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [state?.user]);

  const loadUnreadCount = async () => {
    setIsLoading(true);
    try {
      const response = await getUnreadCount();
      if (response.success) {
        setUnreadCount(response.unread_count);
      }
    } catch (err) {
      console.error('Error loading unread count:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is not authenticated
  if (!state || !state.user) {
    return null;
  }

  return (
    <Link
      to="/notifications"
      className="position-relative text-decoration-none text-dark"
      title={`${unreadCount} unread notifications`}
    >
      <i className="bi bi-bell fs-5"></i>
      {unreadCount > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style={{ fontSize: '0.65rem' }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
          <span className="visually-hidden">unread notifications</span>
        </span>
      )}
    </Link>
  );
};

export default NotificationIndicator;
