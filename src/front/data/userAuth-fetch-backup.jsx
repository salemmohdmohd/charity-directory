const BASE_URL = '/api/auth'

// Token management functions
export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const saveToken = (token) => {
  localStorage.setItem('access_token', token);
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    // Basic JWT token validation (check if expired)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    removeToken();
    return false;
  }
};

const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get current user from token
export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      is_verified: payload.is_verified
    };
  } catch (error) {
    console.error('Error parsing user from token:', error);
    return null;
  }
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.access_token) {
      saveToken(data.access_token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signup = async (name, email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    // Note: Registration doesn't automatically log in, user needs to verify email
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// Get authenticated user data
export const getCurrentUserData = async () => {
  try {
    console.log('=== FRONTEND JWT DEBUG START ===');
    const token = getToken();
    console.log('Token exists:', !!token);
    console.log('Token length:', token ? token.length : 0);

    if (token) {
      // Debug token structure
      const parts = token.split('.');
      console.log('Token parts count:', parts.length);

      if (parts.length === 3) {
        try {
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token header:', header);
          console.log('Token payload:', payload);
          console.log('Token expiration:', new Date(payload.exp * 1000));
          console.log('Current time:', new Date());
          console.log('Token expired:', payload.exp < Date.now() / 1000);
        } catch (e) {
          console.log('Token decode error:', e);
        }
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      ...authHeader()
    };
    console.log('Request headers:', headers);

    const response = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: headers
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      // Try to get detailed error info
      const errorText = await response.text();
      console.log('Error response text:', errorText);

      if (response.status === 401) {
        removeToken();
        throw new Error('Session expired');
      }
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch user data'}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get user data error:', error);
    throw error;
  }
};

// Debug token utility
export const debugToken = async () => {
  try {
    const token = getToken();
    if (!token) {
      console.log('No token to debug');
      return null;
    }

    const response = await fetch(`${BASE_URL}/debug-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    console.log('Token debug result:', result);
    return result;
  } catch (error) {
    console.error('Token debug error:', error);
    return null;
  }
};

// Google OAuth functions
export const initiateGoogleOAuth = () => {
  window.location.href = `${BASE_URL}/google`;
};

export const linkGoogleAccount = async () => {
  try {
    const response = await fetch(`${BASE_URL}/google/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to link Google account');
    }

    // Redirect to Google OAuth
    window.location.href = data.authorization_url;
  } catch (error) {
    console.error('Google link error:', error);
    throw error;
  }
};

export const unlinkGoogleAccount = async () => {
  try {
    const response = await fetch(`${BASE_URL}/google/unlink`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to unlink Google account');
    }

    return data;
  } catch (error) {
    console.error('Google unlink error:', error);
    throw error;
  }
};

// Password reset functions
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset email');
    }

    return data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, new_password: newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await fetch(`${BASE_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

export const logout = async () => {
  removeToken();
  return { message: 'Logged out successfully' };
};

// Update user profile
export const updateProfile = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data.user;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};