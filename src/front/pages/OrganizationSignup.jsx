import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/forms/Button';
import Input from '../components/forms/Input';
import Select from '../components/forms/Select';
import TextArea from '../components/forms/TextArea';
import Checkbox from '../components/forms/Checkbox';

export const OrganizationSignup = () => {
  const [formData, setFormData] = useState({
    // Organization info
    organization_name: '',
    category_id: '',
    mission: '',
    description: '',
    website: '',

    // Admin contact
    admin_name: '',
    admin_email: '',
    password: '',
    confirmPassword: '',
    phone: '',

    // Location
    address: '',
    city: '',
    state: '',
    country: '',

    // Agreements
    agreeToTerms: false,
    verifyInformation: false
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { organizationSignup, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

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

    // Organization validation
    if (!formData.organization_name) {
      newErrors.organization_name = 'Organization name is required';
    } else if (formData.organization_name.length < 3) {
      newErrors.organization_name = 'Organization name must be at least 3 characters';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (!formData.mission) {
      newErrors.mission = 'Mission statement is required';
    } else if (formData.mission.length < 50) {
      newErrors.mission = 'Mission statement must be at least 50 characters';
    }

    // Admin contact validation
    if (!formData.admin_name) {
      newErrors.admin_name = 'Admin name is required';
    }

    if (!formData.admin_email) {
      newErrors.admin_email = 'Admin email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.admin_email)) {
      newErrors.admin_email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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

    setLoading(true);
    clearError();

    try {
      // Prepare data for the API (exclude confirmPassword and agreements)
      const { confirmPassword, agreeToTerms, verifyInformation, ...apiData } = formData;

      // Convert category_id to integer
      apiData.category_id = parseInt(apiData.category_id);

      const response = await organizationSignup(apiData);

      setLoading(false);

      // Redirect to login page with success message after a short delay
      setTimeout(() => {
        navigate('/organization-login?message=registration-success');
      }, 2000);
    } catch (error) {
      setLoading(false);
      // Error handling is done in useAuth hook
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
                {/* Error Display */}
                {error && (
                  <div className="alert alert-danger mb-4">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Organization Information */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-building me-2"></i>
                    Organization Information
                  </h5>

                                    <Input
                    name="organization_name"
                    type="text"
                    label="Organization Name"
                    value={formData.organization_name}
                    onChange={handleChange}
                    error={errors.organization_name}
                    placeholder="Your Charity Organization Name"
                    required
                  />

                  <Select
                    name="category_id"
                    label="Category"
                    value={formData.category_id}
                    onChange={handleChange}
                    error={errors.category_id}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="1">Health</option>
                    <option value="2">Education</option>
                    <option value="3">Environment</option>
                    <option value="4">Community Development</option>
                    <option value="5">Animals & Wildlife</option>
                    <option value="6">Disaster Relief</option>
                    <option value="7">Human Rights</option>
                    <option value="8">Arts & Culture</option>
                    <option value="9">Social Services</option>
                    <option value="10">Other</option>
                  </Select>

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
                        name="admin_name"
                        type="text"
                        label="Admin Full Name"
                        value={formData.admin_name}
                        onChange={handleChange}
                        error={errors.admin_name}
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
                    name="admin_email"
                    type="email"
                    label="Admin Email Address"
                    value={formData.admin_email}
                    onChange={handleChange}
                    error={errors.admin_email}
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
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Registering Organization...
                      </>
                    ) : (
                      'Submit Organization Registration'
                    )}
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
