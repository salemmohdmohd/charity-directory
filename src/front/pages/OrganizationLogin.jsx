import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/forms/Button';
import Input from '../components/forms/Input';

export const OrganizationLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login, isAuthenticated, user, error } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'org_admin') {
        navigate('/organization-dashboard');
      } else {
        // If a regular user lands here, send them to their dashboard
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear specific error when user types
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
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const loggedInUser = await login(formData.email, formData.password);
      // The useAuth hook handles setting the user state.
      // The useEffect hook will then handle redirection on the next render.
      if (loggedInUser?.role !== 'org_admin') {
        // This case is for when a non-org user successfully logs in via this form.
        // We can rely on the useEffect to redirect, or do it manually.
        // The useAuth hook should set an error if the login is invalid.
      }
    } catch (err) {
      // Error is handled globally by the useAuth hook.
      // No specific action needed here unless you want custom component-level feedback.
      console.error("Organization login failed:", err);
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for future implementation
    alert('Google OAuth for organizations coming soon!');
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

              {/* Display global error from useAuth hook */}
              {error && <div className="alert alert-danger">{error}</div>}

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