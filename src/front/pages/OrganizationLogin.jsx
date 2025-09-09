import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/forms/Button';
import Input from '../components/forms/Input';

export const OrganizationLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Organization email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid organization email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters for organizations';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const { user } = await login(formData.email, formData.password);

      // After successful login, the useAuth hook updates the global state.
      // We can now check the user's role and navigate accordingly.

      if (user && user.role === 'org_admin') {
        dispatch({ type: 'SET_NOTIFICATION', payload: 'Welcome to your organization dashboard!' });
        navigate('/organization-dashboard');
      } else {
        // Optional: handle cases where an organization admin might have a different role
        // or for general users trying to log in here.
        dispatch({ type: 'SET_ERROR', payload: 'Access denied. Please use the correct login page.' });
        navigate('/login');
      }
    } catch (error) {
      // The useAuth hook will dispatch the error, but you can add component-specific error handling here if needed.
      console.error("Organization login failed:", error);
      // The error is already set in the global state by the hook, so no need to dispatch here unless you want to override it.
    }
  };

  const handleGoogleLogin = () => {
    dispatch({ type: 'SET_NOTIFICATION', payload: 'Google OAuth for organizations coming soon!' });
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow border-primary">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="fas fa-building fa-3x text-primary"></i>
                </div>
                <h2 className="h3 mb-3">Organization Portal</h2>
                <p className="text-muted">Login to manage your charity organization</p>
              </div>

              <form onSubmit={handleSubmit}>
                <Input
                  name="email"
                  type="email"
                  label="Organization Email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="admin@yourcharity.org"
                  required
                />

                <Input
                  name="password"
                  type="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter your secure password"
                  required
                />

                <div className="d-grid gap-2 mb-3">
                  <Button type="submit" variant="primary" size="lg">
                    Access Organization Dashboard
                  </Button>
                </div>

                <div className="text-center mb-3">
                  <span className="text-muted">or</span>
                </div>

                <div className="d-grid gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline-danger"
                    onClick={handleGoogleLogin}
                  >
                    <i className="fab fa-google me-2"></i>
                    Continue with Google
                  </Button>
                </div>

                <div className="text-center">
                  <small className="text-muted">
                    Need to register your organization? <Link to="/organization-signup" className="text-decoration-none">Register here</Link>
                  </small>
                </div>



                <div className="text-center mt-3">
                  <Link to="/forgot-password" className="text-decoration-none small">
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Organization Benefits */}
          <div className="card mt-4 bg-light">
            <div className="card-body">
              <h6 className="card-title">Organization Portal Features:</h6>
              <ul className="list-unstyled mb-0 small">
                <li><i className="fas fa-check text-success me-2"></i>Manage organization profile</li>
                <li><i className="fas fa-check text-success me-2"></i>Track submission status</li>
                <li><i className="fas fa-check text-success me-2"></i>Upload photos and documents</li>
                <li><i className="fas fa-check text-success me-2"></i>View profile analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
