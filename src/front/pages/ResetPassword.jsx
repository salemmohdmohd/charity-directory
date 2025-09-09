import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import Button from '../components/forms/Button';
import Input from '../components/forms/Input';
import { resetPassword } from '../data/userAuth';

export const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Invalid or missing reset token. Please request a new password reset.'
      });
      navigate('/forgot-password');
    }
  }, [token, dispatch, navigate]);

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await resetPassword(token, formData.password);

      dispatch({
        type: 'SET_NOTIFICATION',
        payload: 'Password reset successfully! You can now log in with your new password.'
      });

      navigate('/login');
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to reset password. The reset link may have expired.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="h3 mb-3">Create New Password</h2>
                <p className="text-muted">
                  Enter your new password below. Make sure it's strong and secure.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <Input
                  name="password"
                  type="password"
                  label="New Password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter new password"
                  required
                  helperText="At least 6 characters with uppercase, lowercase, and number"
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Confirm new password"
                  required
                />

                <div className="d-grid gap-2 mb-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
