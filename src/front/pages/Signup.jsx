import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/forms/Button';
import Input from '../components/forms/Input';
import Checkbox from '../components/forms/Checkbox';

// Define a style to prevent hover effects
const disableHoverStyle = `
  @keyframes none {
    0% { transform: none; }
    100% { transform: none; }
  }

  .no-hover-effect {
    transition: none !important;
    transform: none !important;
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
  }

  .no-hover-effect:hover {
    transform: none !important;
    transition: none !important;
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
  }
`;

export const Signup = () => {
  // Add the style to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = disableHoverStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    profile_picture: null,
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [profilePreview, setProfilePreview] = useState(null);
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

  // Clear global errors and revoke object URLs when component unmounts
  useEffect(() => {
    return () => {
      clearError();
      // Clean up preview URL to prevent memory leaks
      if (profilePreview && profilePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [clearError, profilePreview]);

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
    const { name, value, type, checked, files } = e.target;

    let newValue;
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file') {
      // Handle file uploads
      newValue = files[0] || null;

      // Create image preview for profile picture
      if (name === 'profile_picture' && files[0]) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          setProfilePreview(e.target.result);
        };
        fileReader.readAsDataURL(files[0]);
      }
    } else {
      newValue = value;
    }

    setFormData({
      ...formData,
      [name]: newValue
    });

    // Clear errors when user types or selects files
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

    // Validate profile picture if one is provided
    if (formData.profile_picture) {
      const allowedImageTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'image/webp', 'image/bmp', 'image/tiff'
      ];

      if (!allowedImageTypes.includes(formData.profile_picture.type)) {
        newErrors.profile_picture = 'Please upload a valid image file (JPG, PNG, GIF, etc.)';
      } else if (formData.profile_picture.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors.profile_picture = 'Image size should be less than 5MB';
      }
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check specifically for terms agreement before proceeding
    if (!formData.agreeToTerms) {
      setErrors(prevErrors => ({
        ...prevErrors,
        agreeToTerms: "You must agree to the Terms and Conditions to register"
      }));

      // Alert the user about the terms agreement requirement
      setTimeout(() => {
        const termsCheckbox = document.querySelector('[name="agreeToTerms"]');
        if (termsCheckbox) {
          termsCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          termsCheckbox.focus();
          alert("You must agree to the Terms and Conditions to create an account.");
        }
      }, 100);

      return;
    }

    if (!validateForm()) return;

    try {
      // Create FormData to handle file uploads
      const data = new FormData();

      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        // Skip confirmPassword as it's only for client-side validation
        if (key === 'confirmPassword') return;

        // Skip empty fields
        if (formData[key] === null || formData[key] === '') return;

        // Append the field to FormData
        data.append(key, formData[key]);
      });

      // Call signup with the FormData
      await signup(data);

      // Redirect to dashboard since user is now immediately active
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled by useAuth hook
      console.error('Signup error:', error);
    }
  };

  const handleGoogleSignup = () => {
    clearError(); // Clear any existing errors

    // Check specifically for terms agreement first
    if (!formData.agreeToTerms) {
      setErrors({
        ...errors,
        agreeToTerms: 'You must agree to the Terms and Conditions before proceeding'
      });

      // Alert the user about the terms agreement requirement
      setTimeout(() => {
        const termsCheckbox = document.querySelector('[name="agreeToTerms"]');
        if (termsCheckbox) {
          termsCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          termsCheckbox.focus();
          alert("You must agree to the Terms and Conditions before proceeding.");
        }
      }, 100);

      return;
    }

    initiateGoogleOAuth();
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow no-hover-effect" style={{ transition: 'none', transform: 'none' }}>
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="h3 mb-3">Create Your Account</h2>
                <p className="text-muted">Join to discover and support amazing charities</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-user me-2"></i>
                    Account Information
                  </h5>
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    Profile Picture
                  </label>
                  <div className="d-flex align-items-center mb-2">
                    {profilePreview && (
                      <div className="me-3">
                        <img
                          src={profilePreview}
                          alt="Profile Preview"
                          className="rounded-circle border"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <input
                        type="file"
                        className={`form-control ${errors.profile_picture ? 'is-invalid' : ''}`}
                        name="profile_picture"
                        onChange={handleChange}
                        accept="image/*"
                      />
                      {errors.profile_picture && <div className="invalid-feedback">{errors.profile_picture}</div>}
                      <div className="form-text">Upload a profile picture (optional)</div>
                    </div>
                  </div>
                </div>

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

                <div className="mb-4 mt-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-id-card me-2"></i>
                    Contact Information
                  </h5>
                </div>

                <Input
                  name="phone_number"
                  type="tel"
                  label="Phone Number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={errors.phone_number}
                  placeholder="Enter your phone number"
                />

                <Input
                  name="address"
                  type="text"
                  label="Address"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="Enter your address"
                />

                <div className="row">
                  <div className="col-md-6">
                    <Input
                      name="city"
                      type="text"
                      label="City"
                      value={formData.city}
                      onChange={handleChange}
                      error={errors.city}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      name="state"
                      type="text"
                      label="State"
                      value={formData.state}
                      onChange={handleChange}
                      error={errors.state}
                      placeholder="Enter your state"
                    />
                  </div>
                </div>

                <Input
                  name="zip_code"
                  type="text"
                  label="Zip Code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  error={errors.zip_code}
                  placeholder="Enter your zip code"
                />

                <div className="mb-3">
                  <Checkbox
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    error={errors.agreeToTerms}
                    label={
                      <span className="fw-bold">
                        I agree to the{' '}
                        <Link to="/terms" className="text-primary">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-primary">Privacy Policy</Link>
                        <span className="text-danger ms-1">*</span>
                      </span>
                    }
                    required
                    className="border-left border-danger ps-2"
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
                    title="You must agree to Terms and Conditions before using Google Sign-In"
                  >
                    <i className="fab fa-google me-2"></i>
                    Sign up with Google
                  </Button>
                  <div className="text-center mt-1">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Terms agreement required for all signup methods
                    </small>
                  </div>
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
          <div className="card mt-4 bg-success text-white m-b-5 no-hover-effect">
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
