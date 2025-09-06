import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { saveTokens, getCurrentUserData, removeToken } from '../data/userAuth';

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { initializeAuth } = useAuth();
  const { dispatch } = useGlobalReducer();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check for OAuth error
        const error = searchParams.get('error');
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // Get tokens and user ID from URL params (sent by backend redirect)
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh_token');
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

        // Store both access and refresh tokens
        saveTokens(token, refreshToken);

        // Initialize auth state using the useAuth hook (this will call getCurrentUserData internally)
        await initializeAuth();

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

        // Clear any stored token on error using userAuth function
        removeToken();

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
              <h4 className="mb-3"> Completing Google Authentication</h4>
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
