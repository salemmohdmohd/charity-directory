import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import Button from '../components/forms/Button';
import Input from '../components/forms/Input';
import { forgotPassword } from '../data/userAuth';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useGlobalReducer();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: 'If an account with this email exists, we\'ve sent password reset instructions.'
      });
    } catch (error) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <i className="fas fa-envelope-circle-check text-success" style={{ fontSize: '3rem' }}></i>
                </div>
                <h2 className="h3 mb-3">Check Your Email</h2>
                <p className="text-muted mb-4">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
                <p className="text-muted small mb-4">
                  Didn't receive the email? Check your spam folder or try again in a few minutes.
                </p>
                <div className="d-grid gap-2">
                  <Link to="/login" className="btn btn-primary">
                    Back to Login
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                  >
                    Try Different Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="h3 mb-3">Reset Your Password</h2>
                <p className="text-muted">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                  placeholder="your@email.com"
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
                        Sending...
                      </>
                    ) : (
                      'Send Reset Instructions'
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
