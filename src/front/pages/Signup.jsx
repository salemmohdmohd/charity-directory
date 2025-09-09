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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [validationHints, setValidationHints] = useState({
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '', strength: 'weak' }
  });
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

  // Email validation helper
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    if (!email) {
      return { isValid: false, message: 'Email is required' };
    } else if (!isValid) {
      return { isValid: false, message: 'Please enter a valid email address' };
    } else {
      return { isValid: true, message: 'Valid email address' };
    }
  };

  // Password validation helper
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const validations = [
      { condition: minLength, text: 'At least 8 characters' },
      { condition: hasUppercase, text: 'One uppercase letter' },
      { condition: hasLowercase, text: 'One lowercase letter' },
      { condition: hasNumbers, text: 'One number' },
      { condition: hasSpecialChar, text: 'One special character' }
    ];

    const validCount = validations.filter(v => v.condition).length;

    let strength = 'weak';
    let message = '';

    if (!password) {
      message = 'Password is required';
    } else if (validCount < 3) {
      strength = 'weak';
      message = 'Password is too weak';
    } else if (validCount < 4) {
      strength = 'medium';
      message = 'Password strength: Medium';
    } else {
      strength = 'strong';
      message = 'Password strength: Strong';
    }

    return {
      isValid: validCount >= 3,
      strength,
      message,
      validations
    };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue
    });

    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Real-time validation hints
    if (name === 'email') {
      const emailValidation = validateEmail(newValue);
      setValidationHints(prev => ({
        ...prev,
        email: emailValidation
      }));
    }

    if (name === 'password') {
      const passwordValidation = validatePassword(newValue);
      setValidationHints(prev => ({
        ...prev,
        password: passwordValidation
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Use email validation helper
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }

    // Use password validation helper
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = 'Password must meet security requirements';
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

                <div className="mb-3">
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
                  {formData.email && (
                    <div className={`mt-1 small ${validationHints.email.isValid ? 'text-success' : 'text-danger'}`}>
                      <i className={`fas ${validationHints.email.isValid ? 'fa-check-circle' : 'fa-exclamation-circle'} me-1`}></i>
                      {validationHints.email.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setShowPasswordRequirements(true)}
                      onBlur={() => setShowPasswordRequirements(false)}
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}

                  {(formData.password || showPasswordRequirements) && (
                    <div className="mt-2">
                      {formData.password && (
                        <div className={`small mb-2 ${
                          validationHints.password.strength === 'strong' ? 'text-success' :
                          validationHints.password.strength === 'medium' ? 'text-warning' : 'text-danger'
                        }`}>
                          <strong>{validationHints.password.message}</strong>
                        </div>
                      )}

                      {!formData.password && showPasswordRequirements && (
                        <div className="small mb-2 text-muted">
                          <strong>Password Requirements:</strong>
                        </div>
                      )}

                      <div className="row">
                        {(validationHints.password.validations || [
                          { condition: false, text: 'At least 8 characters' },
                          { condition: false, text: 'One uppercase letter' },
                          { condition: false, text: 'One lowercase letter' },
                          { condition: false, text: 'One number' },
                          { condition: false, text: 'One special character' }
                        ]).map((validation, index) => (
                          <div key={index} className="col-12 col-md-6">
                            <small className={`${validation.condition ? 'text-success' : 'text-muted'}`}>
                              <i className={`fas ${validation.condition ? 'fa-check' : 'fa-times'} me-1`}></i>
                              {validation.text}
                            </small>
                          </div>
                        ))}
                      </div>

                      {/* Password strength bar */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="progress" style={{ height: '4px' }}>
                            <div
                              className={`progress-bar ${
                                validationHints.password.strength === 'strong' ? 'bg-success' :
                                validationHints.password.strength === 'medium' ? 'bg-warning' : 'bg-danger'
                              }`}
                              style={{
                                width: validationHints.password.strength === 'strong' ? '100%' :
                                       validationHints.password.strength === 'medium' ? '60%' : '30%'
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}

                  {formData.confirmPassword && formData.password && (
                    <div className={`mt-1 small ${
                      formData.password === formData.confirmPassword ? 'text-success' : 'text-danger'
                    }`}>
                      <i className={`fas ${
                        formData.password === formData.confirmPassword ? 'fa-check-circle' : 'fa-exclamation-circle'
                      } me-1`}></i>
                      {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </div>
                  )}
                </div>

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
