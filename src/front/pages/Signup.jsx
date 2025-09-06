import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/forms/Button';
import Input from '../components/forms/Input';
import Checkbox from '../components/forms/Checkbox';

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const { signup, initiateGoogleOAuth, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear global errors when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await signup(formData.name, formData.email, formData.password);
      // Redirect to dashboard since user is now immediately active
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled by useAuth hook
      console.error('Signup error:', error);
    }
  };

  const handleGoogleSignup = () => {
    clearError(); // Clear any existing errors
    initiateGoogleOAuth();
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="h3 mb-3">Create Your Account</h2>
                <p className="text-muted">Join to discover and support amazing charities</p>
              </div>

              <form onSubmit={handleSubmit}>
                <Input
                  name="name"
                  type="text"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter your full name"
                  required
                />

                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="your@email.com"
                  required
                />

                <Input
                  name="password"
                  type="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Create a password"
                  required
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  required
                />

                <div className="mb-3">
                  <Checkbox
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    error={errors.agreeToTerms}
                    label={
                      <span>
                        I agree to the{' '}
                        <Link to="/terms" className="text-decoration-none">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>
                      </span>
                    }
                    required
                  />
                </div>

                <div className="d-grid gap-2 mb-3">
                  <Button type="submit" variant="primary" size="lg">
                    Create Account
                  </Button>
                </div>

                <div className="text-center mb-3">
                  <span className="text-muted">or</span>
                </div>

                <div className="d-grid gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline-danger"
                    onClick={handleGoogleSignup}
                  >
                    <i className="fab fa-google me-2"></i>
                    Sign up with Google
                  </Button>
                </div>

                <div className="text-center">
                  <small className="text-muted">
                    Already have an account? <Link to="/login" className="text-decoration-none">Login here</Link>
                  </small>
                </div>

                {/* Global Error Display */}
                {error && (
                  <div className="alert alert-danger mt-3" role="alert">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Organization Portal Link */}
          <div className="card mt-4 bg-success text-white">
            <div className="card-body text-center p-4">
              <h6 className="card-title mb-2">
                <i className="fas fa-plus-circle me-2"></i>
                Want to list your charity organization?
              </h6>
              <p className="card-text small mb-3">
                Register your organization to connect with supporters
              </p>
              <Link to="/organization-signup" className="btn btn-light btn-sm">
                List Your Organization
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
