import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dispatch } = useGlobalReducer();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check for OAuth error
        const error = searchParams.get('error');
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // Get token and user ID from URL params (sent by backend redirect)
        const token = searchParams.get('token');
        const userId = searchParams.get('user_id');
        const linked = searchParams.get('linked');

        // Handle account linking success
        if (linked) {
          dispatch({
            type: 'SET_NOTIFICATION',
            payload: `Successfully linked your ${linked} account!`
          });
          navigate('/profile');
          return;
        }

        if (!token || !userId) {
          throw new Error('Authentication data not received');
        }

        // Store the JWT token
        localStorage.setItem('access_token', token);

        // Fetch user data using the token
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();

        // Update global state with user data
        dispatch({
          type: 'SET_USER',
          payload: userData.user
        });

        dispatch({
          type: 'SET_NOTIFICATION',
          payload: 'Welcome! Successfully signed in with Google.'
        });

        // Redirect to dashboard
        navigate('/dashboard');

      } catch (error) {
        console.error('OAuth callback error:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: `Authentication failed: ${error.message}`
        });

        // Clear any stored token on error
        localStorage.removeItem('access_token');

        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card totoro-card">
            <div className="card-body text-center p-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4 className="mb-3">✨ Completing Google Authentication</h4>
              <p className="text-muted">
                Please wait while we process your login with a touch of magic...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
