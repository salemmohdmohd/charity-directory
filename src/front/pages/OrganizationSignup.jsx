import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orgSignupService } from '../Services/orgSignupService';
import useAuth from '../hooks/useAuth';
import Button from '../components/forms/Button';
import Input from '../components/forms/Input';
import Select from '../components/forms/Select';
import TextArea from '../components/forms/TextArea';
import Checkbox from '../components/forms/Checkbox';

export const OrganizationSignup = () => {
  // Add the styles to the document
  useEffect(() => {
    const errorStyleElement = document.createElement('style');
    errorStyleElement.innerHTML = `
      @keyframes errorPulse {
        0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
        100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
      }
      .highlight-error {
        animation: errorPulse 1.5s ease-in-out;
        border-color: #dc3545 !important;
      }
    `;
    document.head.appendChild(errorStyleElement);

    return () => {
      document.head.removeChild(errorStyleElement);
    };
  }, []);

  const [formData, setFormData] = useState({
    // Organization info
    organization_name: '',
    category_id: '',
    mission: '',
    description: '', // Added
    website: '',
    email: '', // Added
    donation_link: '', // Added
    established_year: '', // Added
    operating_hours: '', // Added

    // Social Media Links
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    youtube_url: '',

    // Media
    logo: null,
    gallery: [],

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
    postal_code: '',

    // Agreements
    agreeToTerms: false,
    verifyInformation: false
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoryState, setCategoryState] = useState({ loading: true, error: null });
  const [loading, setLoading] = useState(false);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);
  const { organizationSignup, initiateGoogleOAuth, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/organization-dashboard');
    }
  }, [isAuthenticated, navigate]);  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (categories.length === 0) { // Only fetch if categories are not already loaded
        setCategoryState({ loading: true, error: null });
        try {
    const data = await orgSignupService.getCategories();
          // The service now directly returns the array
          setCategories(data || []);
          setCategoryState({ loading: false, error: null });
        } catch (error) {
          console.error('Failed to fetch categories:', error);
          setCategoryState({ loading: false, error: 'Could not load categories. Please try again later.' });
          setCategories([]); // Ensure categories is an array in case of an error
        }
      }
    };
    fetchCategories();
  }, [categories]);

  // Clear global errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
      // Clean up preview URLs to prevent memory leaks
      previewImages.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [clearError, previewImages]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    let newValue;
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file') {
      if (name === 'logo') {
        newValue = files[0] || null;
        // Debug logging for logo
        if (files[0]) {
          // logo selected; debug logs removed for production
        }
      } else if (name === 'gallery') {
        newValue = Array.from(files);
        // Debug logging for gallery
          if (files.length > 0) {
          // gallery files selected; debug logs removed for production

          // Generate preview URLs for the gallery images
          const previews = Array.from(files).map(file => ({
            file,
            url: URL.createObjectURL(file),
            isPrimary: false,
            fileSize: file.size // Capture file size for database storage
          }));

          // Set the first image as primary by default
          if (previews.length > 0) {
            previews[0].isPrimary = true;
          }

          setPreviewImages(previews);
          setPrimaryPhotoIndex(0);
        }
      } else {
        newValue = files;
      }
    } else {
      newValue = value;
    }

    setFormData({
      ...formData,
      [name]: newValue
    });

    // Clear errors when user types/selects files
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Helper function to validate social media URLs
  const validateSocialMediaUrl = (url, platform) => {
    if (!url) return true; // Optional fields

    // Basic URL validation
    if (!/^https?:\/\/.+/.test(url)) {
      return `Please enter a valid URL for your ${platform} profile`;
    }

    // Platform-specific validation
    switch (platform.toLowerCase()) {
      case 'facebook':
        return url.includes('facebook.com') || url.includes('fb.com') ?
          true : 'Please enter a valid Facebook URL (e.g., facebook.com/yourpage)';
      case 'instagram':
        return url.includes('instagram.com') ?
          true : 'Please enter a valid Instagram URL (e.g., instagram.com/youraccount)';
      case 'twitter':
        return (url.includes('twitter.com') || url.includes('x.com')) ?
          true : 'Please enter a valid Twitter/X URL (e.g., twitter.com/youraccount)';
      case 'linkedin':
        return url.includes('linkedin.com') ?
          true : 'Please enter a valid LinkedIn URL (e.g., linkedin.com/company/yourcompany)';
      case 'youtube':
        return (url.includes('youtube.com') || url.includes('youtu.be')) ?
          true : 'Please enter a valid YouTube URL (e.g., youtube.com/channel/yourchannelid)';
      default:
        return true;
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

    // URL validation function
    const validateUrl = (url, fieldName) => {
      if (url && !url.match(/^(.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/)) {
        newErrors[fieldName] = 'Please enter a valid URL';
      }
    };

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (!formData.mission) {
      newErrors.mission = 'Mission statement is required';
    } else if (formData.mission.length < 50) {
      newErrors.mission = 'Mission statement must be at least 50 characters';
    }

    if (!formData.description) {
      newErrors.description = 'A detailed description is required';
    } else if (formData.description.length < 100) {
      newErrors.description = 'Description must be at least 100 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Public email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid public email for the organization';
    }

    if (!formData.website) {
      newErrors.website = 'Website is required';
    } else if (!/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL for your website';
    }

    // donation_link is optional; organizations may not accept donations or may not provide a link
    if (formData.donation_link && !/^https?:\/\/.+/.test(formData.donation_link)) {
      newErrors.donation_link = 'Please enter a valid URL for the donation link';
    }

    if (!formData.established_year) {
      newErrors.established_year = 'Year established is required';
    }

    if (!formData.operating_hours) {
      newErrors.operating_hours = 'Operating hours are required';
    }

    // Social media URL validation
    validateUrl(formData.facebook_url, 'facebook_url');
    validateUrl(formData.instagram_url, 'instagram_url');
    validateUrl(formData.twitter_url, 'twitter_url');
    validateUrl(formData.linkedin_url, 'linkedin_url');
    validateUrl(formData.youtube_url, 'youtube_url');

    // Social media URL validation
    const socialPlatforms = [
      { field: 'facebook_url', name: 'Facebook' },
      { field: 'instagram_url', name: 'Instagram' },
      { field: 'twitter_url', name: 'Twitter' },
      { field: 'linkedin_url', name: 'LinkedIn' },
      { field: 'youtube_url', name: 'YouTube' }
    ];

    socialPlatforms.forEach(platform => {
      const url = formData[platform.field];
      if (!url) {
        newErrors[platform.field] = `${platform.name} URL is required`;
      } else {
        const validationResult = validateSocialMediaUrl(url, platform.name);
        if (validationResult !== true) {
          newErrors[platform.field] = validationResult;
        }
      }
    });

    if (formData.established_year) {
      const year = parseInt(formData.established_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1800 || year > currentYear) {
        newErrors.established_year = `Please enter a valid year between 1800 and ${currentYear}`;
      }
    }

    // Media validation - made more flexible
    const allowedImageTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'image/webp', 'image/bmp', 'image/tiff'
    ];

    // Also check file extensions as fallback
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];

    const isValidImageFile = (file) => {
      if (!file) return false; // Files are now required

      // Check MIME type first
      if (allowedImageTypes.includes(file.type.toLowerCase())) {
        return true;
      }

      // Fallback to file extension check
      const fileName = file.name.toLowerCase();
      return allowedExtensions.some(ext => fileName.endsWith(ext));
    };

    if (!formData.logo) {
      newErrors.logo = 'Organization logo is required';
    } else if (!isValidImageFile(formData.logo)) {
          // Logo file type logging removed for production
      newErrors.logo = 'Invalid file type. Please upload a valid image file (JPG, PNG, GIF, WebP, BMP, TIFF).';
    }

    if (!formData.gallery || formData.gallery.length === 0) {
      newErrors.gallery = 'At least one gallery image is required';
    } else if (formData.gallery.length > 5) {
      newErrors.gallery = 'You can upload a maximum of 5 gallery images.';
    } else {
          for (let i = 0; i < formData.gallery.length; i++) {
        if (!isValidImageFile(formData.gallery[i])) {
          // Gallery file debug removed for production
          newErrors.gallery = `Invalid file type for file ${i + 1}. Please upload only valid image files (JPG, PNG, GIF, WebP, BMP, TIFF).`;
          break;
        }
      }
    }

    // Admin contact validation
    if (!formData.admin_name) {
      newErrors.admin_name = 'Admin name is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
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
    if (!formData.address) {
      newErrors.address = 'Street address is required';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State/Province is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.postal_code) {
      newErrors.postal_code = 'Postal/ZIP code is required';
    }

    // Agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    if (!formData.verifyInformation) {
      newErrors.verifyInformation = 'You must verify that the information is accurate';
    }

    setErrors(newErrors);

    // If there are errors, log them to console for debugging
    if (Object.keys(newErrors).length > 0) {
      // Validation failed; errors are set in state for the UI. Debug logs removed for production.
    }

    return newErrors;
  };

    // Helper function to scroll to the first error field
    const scrollToFirstError = (errorsList) => {
      if (Object.keys(errorsList).length > 0) {
        const errorFieldId = Object.keys(errorsList)[0];

        // Try to find the input field
        let errorField = document.querySelector(`[name="${errorFieldId}"]`);

        // If not found directly (can happen with file inputs and some complex components)
        if (!errorField) {
          // Try to find a label associated with this field
          const labelSelector = `label[for="${errorFieldId}"]`;
          const label = document.querySelector(labelSelector);

          if (label) {
            errorField = label;
          } else {
            // As a fallback, find any element containing this field name in the DOM
            const container = document.querySelector(`*[data-field="${errorFieldId}"], *[id*="${errorFieldId}"], *[class*="${errorFieldId}"]`);
            if (container) {
              errorField = container;
            }
          }
        }

        if (errorField) {
          // Scroll with offset to ensure field is visible
          const yOffset = -100; // 100px offset from the top
          const y = errorField.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({
            top: y,
            behavior: 'smooth'
          });

          // Try to focus if it's a focusable element
          try {
            errorField.focus({ preventScroll: true });
          } catch (e) {
            // focusing may fail in some browsers; suppress in production
          }

          // Highlight the field with a temporary highlight effect
          try {
            errorField.classList.add('highlight-error');
            setTimeout(() => {
              errorField.classList.remove('highlight-error');
            }, 1500);
          } catch (e) {
            // highlight may fail silently in some environments
          }

          return true;
        }
      }
      return false;
    };

    const handleGoogleSignup = () => {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        // Scroll to the error summary
        setTimeout(() => {
          const errorSummary = document.getElementById('error-summary');
          if (errorSummary) {
            errorSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            // Fallback to first field if summary not found
            scrollToFirstError(validationErrors);
          }
        }, 100);
        return;
      }

      // Specifically check for terms agreement first
      if (!formData.agreeToTerms) {
        // Set error for terms agreement
        setErrors({
          ...errors,
          agreeToTerms: 'You must agree to the terms and conditions before proceeding'
        });

        // Scroll to terms checkbox
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

      // All fields are filled, proceed with Google OAuth
      initiateGoogleOAuth();
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      // Scroll to the error summary
      setTimeout(() => {
        const errorSummary = document.getElementById('error-summary');
        if (errorSummary) {
          errorSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Fallback to first field if summary not found
          scrollToFirstError(validationErrors);
        }
      }, 100);
      return;
    }

    // Check specifically for terms agreement before proceeding
    if (!formData.agreeToTerms) {
      setErrors(prevErrors => ({
        ...prevErrors,
        agreeToTerms: "You must agree to the Terms and Conditions to register"
      }));

      scrollToFirstError({ agreeToTerms: "You must agree to the Terms and Conditions to register" });
      alert("You must agree to the Terms and Conditions to register your organization.");
      return;
    }

    setLoading(true);
    clearError();

    try {
      const data = new FormData();

      // Append all form fields to the FormData object
      for (const key in formData) {
        if (key === 'gallery') {
          for (let i = 0; i < formData.gallery.length; i++) {
            data.append('gallery', formData.gallery[i]);

            // Add metadata for each photo (is_primary, sort_order, and file_size)
            const metadata = {
              is_primary: i === primaryPhotoIndex,
              sort_order: i,
              file_size: formData.gallery[i].size || 0
            };
            data.append('photo_metadata', JSON.stringify(metadata));
          }
        } else if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      }

      // Add default values according to UML model
      data.append('status', 'pending'); // Organizations start as pending until approved by admin
      data.append('verification_level', 'basic'); // Start with basic verification level
      data.append('is_verified', 'false'); // Not verified by default
      data.append('view_count', '0'); // Start with 0 views
      data.append('bookmark_count', '0'); // Start with 0 bookmarks

      // The organizationSignup function in useAuth needs to be able to handle FormData
      const response = await organizationSignup(data);

      setLoading(false);

      // Redirect to dashboard page with success message after a short delay
      setTimeout(() => {
        navigate('/organization-dashboard');
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

              <form onSubmit={handleSubmit} noValidate>
                {/* Validation Error Summary */}
                {Object.keys(errors).length > 0 && (
                  <div id="error-summary" className="alert alert-danger mb-4" role="alert">
                    <h5 className="alert-heading">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Please correct the errors below:
                    </h5>
                    <ul>
                      {Object.entries(errors).map(([field, message]) => (
                        <li key={field}>
                          <a href={`#${field}`} onClick={(e) => {
                            e.preventDefault();
                            document.querySelector(`[name="${field}"]`)?.focus();
                          }}>
                            {message}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* API Error Display */}
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
                    id="organization_name"
                  />

                  <Select
                    name="category_id"
                    label="Category"
                    value={formData.category_id}
                    onChange={handleChange}
                    error={errors.category_id || categoryState.error}
                    required
                    disabled={categoryState.loading}
                    options={categories.map(category => ({ value: category.id, label: category.name }))}
                    placeholder={categoryState.loading ? 'Loading categories...' : 'Select a category'}
                    id="category_id"
                  />

                  <TextArea
                    name="mission"
                    label="Mission Statement"
                    value={formData.mission}
                    onChange={handleChange}
                    error={errors.mission}
                    placeholder="Briefly describe your organization's mission and core purpose (minimum 50 characters)"
                    rows={3}
                    required
                    id="mission"
                  />

                  <TextArea
                    name="description"
                    label="Detailed Description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    placeholder="Provide a detailed description of your organization's activities, history, and impact (minimum 100 characters)"
                    rows={5}
                    required
                    id="description"
                  />

                  <div className="row">
                    <div className="col-md-6">
                      <Input
                        name="website"
                        type="url"
                        label="Website"
                        value={formData.website}
                        onChange={handleChange}
                        error={errors.website}
                        placeholder="yourorganization.org"
                        required
                        id="website"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        name="email"
                        type="email"
                        label="Public Email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="contact@yourorganization.org"
                        required
                        id="email"
                      />
                    </div>
                  </div>

                  <Input
                    name="donation_link"
                    type="url"
                    label="Donation Link"
                    value={formData.donation_link}
                    onChange={handleChange}
                    error={errors.donation_link}
                    placeholder="yourorganization.org/donate"
                    required
                    id="donation_link"
                  />

                  <div className="row">
                    <div className="col-md-6">
                      <Input
                        name="established_year"
                        type="number"
                        label="Year Established"
                        value={formData.established_year}
                        onChange={handleChange}
                        error={errors.established_year}
                        placeholder="e.g., 1995"
                        required
                        id="established_year"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        name="operating_hours"
                        type="text"
                        label="Operating Hours"
                        value={formData.operating_hours}
                        onChange={handleChange}
                        error={errors.operating_hours}
                        placeholder="e.g., Mon-Fri, 9am-5pm"
                        required
                        id="operating_hours"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-share-alt me-2"></i>
                    Social Media Links
                  </h5>
                  <div className="small text-muted mb-3">
                    Add links to your organization's social media profiles to increase your visibility and connect with supporters.
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <Input
                        name="facebook_url"
                        type="url"
                        label={<><i className="fab fa-facebook text-primary me-2"></i>Facebook</>}
                        value={formData.facebook_url}
                        onChange={handleChange}
                        error={errors.facebook_url}
                        placeholder="facebook.com/yourorganization"
                        required
                        id="facebook_url"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        name="instagram_url"
                        type="url"
                        label={<><i className="fab fa-instagram text-danger me-2"></i>Instagram</>}
                        value={formData.instagram_url}
                        onChange={handleChange}
                        error={errors.instagram_url}
                        placeholder="instagram.com/yourorganization"
                        required
                        id="instagram_url"
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <Input
                        name="twitter_url"
                        type="url"
                        label={<><i className="fab fa-twitter text-info me-2"></i>Twitter/X</>}
                        value={formData.twitter_url}
                        onChange={handleChange}
                        error={errors.twitter_url}
                        placeholder="twitter.com/yourorganization"
                        required
                        id="twitter_url"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        name="linkedin_url"
                        type="url"
                        label={<><i className="fab fa-linkedin text-primary me-2"></i>LinkedIn</>}
                        value={formData.linkedin_url}
                        onChange={handleChange}
                        error={errors.linkedin_url}
                        placeholder="linkedin.com/company/yourorganization"
                        required
                        id="linkedin_url"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Input
                        name="youtube_url"
                        type="url"
                        label={<><i className="fab fa-youtube text-danger me-2"></i>YouTube</>}
                        value={formData.youtube_url}
                        onChange={handleChange}
                        error={errors.youtube_url}
                        placeholder="youtube.com/c/yourorganization"
                        required
                        id="youtube_url"
                      />
                    </div>
                  </div>
                </div>

                {/* Media Uploads */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-camera-retro me-2"></i>
                    Media Uploads
                  </h5>
                  <Input
                    name="logo"
                    type="file"
                    label="Organization Logo"
                    onChange={handleChange}
                    error={errors.logo}
                    helpText="Upload your organization's logo. Supports JPG, PNG, GIF, WebP, BMP, and TIFF formats."
                    required
                    id="logo"
                  />
                  <Input
                    name="gallery"
                    type="file"
                    label="Photo Gallery (up to 5 images)"
                    onChange={handleChange}
                    error={errors.gallery}
                    multiple
                    helpText="Upload images that showcase your organization's work. Supports common image formats."
                    required
                    id="gallery"
                  />

                  {/* Gallery Preview with Primary Photo Selection */}
                  {previewImages.length > 0 && (
                    <div className="mt-4">
                      <label className="form-label">Gallery Preview</label>
                      <div className="small text-muted mb-2">
                        Select which image should be the primary photo for your organization.
                        The primary photo will be featured on your profile card.
                      </div>
                      <div className="row g-3">
                        {previewImages.map((preview, index) => (
                          <div key={index} className="col-6 col-md-4">
                            <div
                              className={`card h-100 ${primaryPhotoIndex === index ? 'border-primary' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setPrimaryPhotoIndex(index)}
                            >
                              <img
                                src={preview.url}
                                className="card-img-top"
                                alt={`Preview ${index+1}`}
                                style={{height: '150px', objectFit: 'cover'}}
                              />
                              <div className="card-body p-2">
                                <div className="form-check">
                                  <input
                                    type="radio"
                                    className="form-check-input"
                                    name="primaryPhoto"
                                    id={`primary-photo-${index}`}
                                    checked={primaryPhotoIndex === index}
                                    onChange={() => setPrimaryPhotoIndex(index)}
                                  />
                                  <label className="form-check-label" htmlFor={`primary-photo-${index}`}>
                                    {primaryPhotoIndex === index ? (
                                      <strong>Primary Photo</strong>
                                    ) : (
                                      "Set as Primary"
                                    )}
                                  </label>
                                </div>
                                <div className="small text-muted mt-1">
                                  Order: {index + 1}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="small text-muted mt-2">
                        <i className="fas fa-info-circle me-1"></i>
                        The primary photo will be displayed on organization cards and as the hero image on your profile.
                      </div>
                    </div>
                  )}
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
                        id="admin_name"
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
                        required
                        id="phone"
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
                    id="admin_email"
                  />

                  <Input
                    name="password"
                    type="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Create a secure password"
                    required
                    id="password"
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
                    id="confirmPassword"
                  />
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
                    required
                    id="address"
                  />

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <Input
                        name="city"
                        type="text"
                        label="City"
                        value={formData.city}
                        onChange={handleChange}
                        error={errors.city}
                        placeholder="City name"
                        required
                        id="city"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        name="state"
                        type="text"
                        label="State/Province"
                        value={formData.state}
                        onChange={handleChange}
                        error={errors.state}
                        placeholder="State or Province"
                        required
                        id="state"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Input
                        name="country"
                        type="text"
                        label="Country"
                        value={formData.country}
                        onChange={handleChange}
                        error={errors.country}
                        placeholder="Country"
                        required
                        id="country"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        name="postal_code"
                        type="text"
                        label="Postal/ZIP Code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        error={errors.postal_code}
                        placeholder="e.g., 90210"
                        required
                        id="postal_code"
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
                    id="verifyInformation"
                  />

                  <Checkbox
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    error={errors.agreeToTerms}
                    label={
                      <span className="fw-bold">
                        I agree to the <Link to="/terms" className="text-primary">Terms of Service</Link> and{' '}
                        <Link to="/privacy" className="text-primary">Privacy Policy</Link>
                        <span className="text-danger ms-1">*</span>
                      </span>
                    }
                    required
                    className="border-left border-danger ps-2"
                    id="agreeToTerms"
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
                  <div className="d-flex justify-content-center align-items-center mt-2 py-1 bg-light border border-primary rounded">
                    <i className="fas fa-arrow-up text-primary me-2"></i>
                    <span className="text-primary fw-bold">Required to complete your registration</span>
                  </div>

                  <div className="text-center my-3">
                    <span className="text-muted">or after filling all required fields</span>
                  </div>

                  <div className="position-relative">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="lg"
                      onClick={handleGoogleSignup}
                      className="d-flex align-items-center justify-content-center w-100"
                      title="You must agree to Terms and Conditions and fill all required fields before using Google Sign-In"
                    >
                      <i className="fab fa-google me-2"></i>
                      Complete registration with Google
                    </Button>
                    <div className="position-absolute top-0 end-0 translate-middle-y">
                      <span className="badge rounded-pill bg-primary">
                        <i className="fas fa-check-circle me-1"></i>Fill required fields first
                      </span>
                    </div>
                  </div>

                  <div className="card bg-light border-secondary mt-3">
                    <div className="card-body py-2">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-info-circle text-primary me-2"></i>
                        <span className="fw-bold">Complete With Google</span>
                      </div>
                      <small>
                        <strong>All form fields must be filled</strong> before you can use Google authentication.
                        After validating all fields, you'll be able to use Google to complete your admin login credentials
                        and finalize your organization's registration.
                      </small>
                    </div>
                  </div>
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
