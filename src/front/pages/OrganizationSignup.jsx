import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import Button from '../components/forms/Button';
import Input from '../components/forms/Input';
import Select from '../components/forms/Select';
import TextArea from '../components/forms/TextArea';
import Checkbox from '../components/forms/Checkbox';

export const OrganizationSignup = () => {
  const [formData, setFormData] = useState({
    // Organization Details
    organizationName: '',
    category: '',
    mission: '',
    website: '',

    // Contact Information
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    phone: '',

    // Address
    address: '',
    city: '',
    state: '',
    country: '',

    // Agreements
    agreeToTerms: false,
    verifyInformation: false
  });
  const [errors, setErrors] = useState({});
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

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

    // Organization validation
    if (!formData.organizationName) {
      newErrors.organizationName = 'Organization name is required';
    } else if (formData.organizationName.length < 3) {
      newErrors.organizationName = 'Organization name must be at least 3 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.mission) {
      newErrors.mission = 'Mission statement is required';
    } else if (formData.mission.length < 50) {
      newErrors.mission = 'Mission statement must be at least 50 characters';
    }

    // Admin contact validation
    if (!formData.adminName) {
      newErrors.adminName = 'Admin name is required';
    }

    if (!formData.adminEmail) {
      newErrors.adminEmail = 'Admin email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters for organizations';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Location validation
    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    // Agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    if (!formData.verifyInformation) {
      newErrors.verifyInformation = 'You must verify that the information is accurate';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Simulate API call for organization signup
      setTimeout(() => {
        dispatch({ type: 'SET_USER', payload: {
          name: formData.organizationName,
          email: formData.email,
          role: 'organization'
        }});
        dispatch({ type: 'SET_NOTIFICATION', payload: 'Organization registered successfully! Please check your email for verification.' });
        navigate('/organization-dashboard');
      }, 1500);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow border-primary">
            <div className="card-body p-5">
              <div className="text-center mb-5">
                <div className="mb-3">
                  <i className="fas fa-hands-helping fa-3x text-primary"></i>
                </div>
                <h2 className="h3 mb-3">Register Your Organization</h2>
                <p className="text-muted">Join our platform to connect with supporters and increase your impact</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Organization Information */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-building me-2"></i>
                    Organization Information
                  </h5>

                  <Input
                    name="organizationName"
                    type="text"
                    label="Organization Name"
                    value={formData.organizationName}
                    onChange={handleChange}
                    error={errors.organizationName}
                    placeholder="Your Charity Organization Name"
                    required
                  />

                  <Select
                    name="category"
                    label="Organization Category"
                    value={formData.category}
                    onChange={handleChange}
                    error={errors.category}
                    required
                    options={[
                      { value: '', label: 'Select a category' },
                      ...store.categories.map(cat => ({ value: cat, label: cat }))
                    ]}
                  />

                  <TextArea
                    name="mission"
                    label="Mission Statement"
                    value={formData.mission}
                    onChange={handleChange}
                    error={errors.mission}
                    placeholder="Describe your organization's mission and goals (minimum 50 characters)"
                    rows={4}
                    required
                  />

                  <Input
                    name="website"
                    type="url"
                    label="Website (Optional)"
                    value={formData.website}
                    onChange={handleChange}
                    error={errors.website}
                    placeholder="https://yourorganization.org"
                  />
                </div>

                {/* Admin Contact Information */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-user-tie me-2"></i>
                    Administrative Contact
                  </h5>

                  <div className="row">
                    <div className="col-md-6">
                      <Input
                        name="adminName"
                        type="text"
                        label="Admin Full Name"
                        value={formData.adminName}
                        onChange={handleChange}
                        error={errors.adminName}
                        placeholder="Primary contact person"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        name="phone"
                        type="tel"
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <Input
                    name="adminEmail"
                    type="email"
                    label="Admin Email Address"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    error={errors.adminEmail}
                    placeholder="admin@yourorganization.org"
                    required
                  />

                  <div className="row">
                    <div className="col-md-6">
                      <Input
                        name="password"
                        type="password"
                        label="Password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="Create a secure password"
                        required
                      />
                    </div>
                    <div className="col-md-6">
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
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Organization Location
                  </h5>

                  <Input
                    name="address"
                    type="text"
                    label="Street Address"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="123 Main Street"
                  />

                  <div className="row">
                    <div className="col-md-4">
                      <Input
                        name="city"
                        type="text"
                        label="City"
                        value={formData.city}
                        onChange={handleChange}
                        error={errors.city}
                        placeholder="City name"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <Input
                        name="state"
                        type="text"
                        label="State/Province"
                        value={formData.state}
                        onChange={handleChange}
                        error={errors.state}
                        placeholder="State or Province"
                      />
                    </div>
                    <div className="col-md-4">
                      <Input
                        name="country"
                        type="text"
                        label="Country"
                        value={formData.country}
                        onChange={handleChange}
                        error={errors.country}
                        placeholder="Country"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Agreements */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-check-circle me-2"></i>
                    Verification & Agreements
                  </h5>

                  <Checkbox
                    name="verifyInformation"
                    checked={formData.verifyInformation}
                    onChange={handleChange}
                    error={errors.verifyInformation}
                    label="I verify that all information provided is accurate and up-to-date"
                    required
                  />

                  <Checkbox
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    error={errors.agreeToTerms}
                    label={
                      <span>
                        I agree to the <Link to="/terms" className="text-decoration-none">Terms of Service</Link> and{' '}
                        <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>
                      </span>
                    }
                    required
                  />
                </div>

                <div className="alert alert-info mb-4">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Review Process:</strong> Your application will be reviewed within 2-3 business days.
                  You'll receive an email notification once approved. Thank you for your patience!
                </div>

                <div className="d-grid gap-2 mb-4">
                  <Button type="submit" variant="primary" size="lg">
                    Submit Organization Registration
                  </Button>
                </div>

                <div className="text-center">
                  <small className="text-muted">
                    Already registered? <Link to="/organization-login" className="text-decoration-none">Login here</Link>
                  </small>
                </div>


              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
