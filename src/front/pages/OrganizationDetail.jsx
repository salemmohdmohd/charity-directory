import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { organizationService } from '../Services/axios';

const OrganizationDetail = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  // Function to format location object into readable string
  const formatLocation = (location) => {
    if (!location) return 'Not specified';

    // If location is already a string, return it
    if (typeof location === 'string') return location;

    // If location is an object, format it
    if (typeof location === 'object') {
      // Check if it's a database reference object or has a toString method that indicates it's not data
      if (location.toString && location.toString().includes('Location')) {
        return 'Location information not available';
      }

      const parts = [];
      if (location.city) parts.push(location.city);
      if (location.state_province) parts.push(location.state_province);
      if (location.country) parts.push(location.country);

      // For postal code, we can add it separately with proper formatting
      let formattedAddress = parts.length > 0 ? parts.join(', ') : '';
      if (location.postal_code && formattedAddress) {
        formattedAddress += ` ${location.postal_code}`;
      } else if (location.postal_code) {
        formattedAddress = location.postal_code;
      }

      return formattedAddress || 'Location information not available';
    }

    return 'Not specified';
  };

  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [error, setError] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Extract organization ID from slug (format: "123-organization-name")
  const getOrgIdFromSlug = (slug) => {
    const match = slug.match(/^(\d+)-/);
    return match ? parseInt(match[1]) : null;
  };

  // Fetch organization data
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('OrganizationDetail: organizationId from URL:', organizationId);

        const orgId = getOrgIdFromSlug(organizationId);
        console.log('OrganizationDetail: extracted orgId:', orgId);

        if (!orgId) {
          setError('Invalid organization ID');
          setLoading(false);
          return;
        }

        console.log('OrganizationDetail: fetching organization with ID:', orgId);
        const orgData = await organizationService.getOrganization(orgId);
        console.log('OrganizationDetail: received organization data:', orgData);

        // Backend returns organization directly, not wrapped in an object
        setOrganization(orgData);

        // Fetch organization photos
        setLoadingPhotos(true);
        try {
          const photosData = await organizationService.getOrganizationPhotos(orgId);
          console.log('OrganizationDetail: received photos data:', photosData);

          // Detailed debugging for photo data
          if (photosData && Array.isArray(photosData)) {
            console.log(`Found ${photosData.length} photos for organization ${orgId}`);
            photosData.forEach((photo, index) => {
              console.log(`Photo ${index}:`, photo);
            });

            // Inspect the first photo to determine field structure
            if (photosData.length > 0) {
              const firstPhoto = photosData[0];
              const possibleFileFields = ['file_name', 'fileName', 'file_path', 'filePath', 'path', 'url', 'src'];
              console.log('Checking possible file name fields in photo object:');
              possibleFileFields.forEach(field => {
                console.log(`- ${field}: ${firstPhoto[field]}`);
              });
            }
          } else {
            console.log('No valid photos array received from API');
          }

          // Use any available file identifier field
          const validPhotos = Array.isArray(photosData)
            ? photosData.map(photo => {
                // Try to determine the file identifier, using the first available field
                const fileId = photo.file_name || photo.fileName || photo.file_path ||
                               photo.filePath || photo.path || photo.url || photo.id;
                return { ...photo, fileIdentifier: fileId };
              }).filter(photo => photo.fileIdentifier)
            : [];

          console.log(`${validPhotos.length} valid photos with file identifiers after processing`);
          setPhotos(validPhotos);
        } catch (photoError) {
          console.error('Error fetching organization photos:', photoError);
          // Don't show an error for photos, just set empty array
          setPhotos([]);
        } finally {
          setLoadingPhotos(false);
        }

        dispatch({
          type: 'SET_NOTIFICATION',
          payload: null
        });

      } catch (error) {
        console.error('Error fetching organization:', error);
        setError('Failed to load organization information. Please try again.');
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to load organization information.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId, dispatch]);

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Please fill in all required fields.'
      });
      return;
    }

    try {
      setIsSubmittingContact(true);

      const orgId = getOrgIdFromSlug(organizationId);
      await organizationService.contactOrganization(orgId, contactForm);

      dispatch({
        type: 'SET_NOTIFICATION',
        payload: 'Message sent successfully! The organization will contact you soon.'
      });

      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Generate organization description for SEO
  const getOrgDescription = () => {
    if (!organization) return 'Learn more about this organization and their mission.';
    return organization.mission || `Learn more about ${organization.name}, a verified organization making a difference in their community.`;
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading organization information...</p>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <>
        <Helmet>
          <title>Organization Not Found - Charity Directory</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <main className="container my-5">
          <div className="text-center">
            <h1 className="display-4 text-danger">Organization Not Found</h1>
            <p className="lead">The organization you're looking for doesn't exist.</p>
            <Link to="/categories" className="btn btn-primary btn-lg">
              Browse Organizations
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{organization?.name || 'Organization'} - Charity Directory</title>
        <meta name="description" content={getOrgDescription()} />
        <meta name="keywords" content={`${organization?.name || 'organization'}, charity, nonprofit, donations, volunteer, ${organization?.location || ''}`} />
        <link rel="canonical" href={`${window.location.origin}/organizations/${organizationId}`} />

        {/* Open Graph tags */}
        <meta property="og:title" content={`${organization?.name || 'Organization'} - Charity Directory`} />
        <meta property="og:description" content={getOrgDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/organizations/${organizationId}`} />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${organization?.name || 'Organization'} - Charity Directory`} />
        <meta name="twitter:description" content={getOrgDescription()} />

        {/* JSON-LD structured data */}
        {organization && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": organization.name,
              "description": getOrgDescription(),
              "url": organization.website || `${window.location.origin}/organizations/${organizationId}`,
              "address": formatLocation(organization.address || organization.location),
              "email": organization.email,
              "telephone": organization.phone,
              "sameAs": organization.website ? [organization.website] : []
            })}
          </script>
        )}
      </Helmet>      <main className="container my-5">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/categories" className="text-decoration-none">Categories</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {organization.name}
            </li>
          </ol>
        </nav>

        {/* Organization Header */}
        <header className="mb-5">
          <div className="row">
            <div className="col-lg-8">
              <div className="d-flex align-items-start mb-3">
                {/* Organization Logo */}
                <div className="me-3">
                  {organization.logo_url ? (
                    <img
                      src={`/api/uploads/${organization.logo_url}`}
                      alt={`${organization.name} logo`}
                      className="rounded border"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="bg-light border rounded d-flex align-items-center justify-content-center"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <i className="fas fa-heart text-muted" style={{ fontSize: '2rem' }}></i>
                    </div>
                  )}
                </div>

                <div className="flex-grow-1">
                  <h1 className="display-5 mb-2 text-forest">{organization.name}</h1>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {organization.verification_status === 'verified' && (
                      <span className="badge bg-success fs-6">
                        <i className="fas fa-check-circle me-1" aria-hidden="true"></i>
                        Verified Organization
                      </span>
                    )}

                    {organization.verification_level && organization.verification_level !== 'basic' && (
                      <span className="badge bg-info fs-6">
                        <i className="fas fa-star me-1" aria-hidden="true"></i>
                        {organization.verification_level.charAt(0).toUpperCase() + organization.verification_level.slice(1)}
                      </span>
                    )}

                    {organization.established_year && (
                      <span className="badge bg-secondary fs-6">
                        <i className="fas fa-calendar me-1" aria-hidden="true"></i>
                        Est. {organization.established_year}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {organization.mission && (
                <div className="mb-4">
                  <h2 className="h5 text-secondary mb-2">Mission Statement</h2>
                  <p className="lead">{organization.mission}</p>
                </div>
              )}
            </div>

            <div className="col-lg-4">
              <div className="card totoro-card">
                <div className="card-body">
                  <h3 className="card-title h6 text-uppercase text-muted mb-3">Quick Actions</h3>

                  {organization.website && (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn calcifer-button w-100 mb-2"
                    >
                      <i className="fas fa-external-link-alt me-2" aria-hidden="true"></i>
                      Visit Website
                    </a>
                  )}

                  {/* Donation links are disabled in this deployment - we don't process donations. */}
                  {organization.donation_link && (
                    <div className="alert alert-secondary mb-2" role="alert">
                      <i className="fas fa-info-circle me-2" aria-hidden="true"></i>
                      This platform does not process donations. Please visit the organization's website for giving options.
                    </div>
                  )}

                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => document.getElementById('contact-section').scrollIntoView({ behavior: 'smooth' })}
                  >
                    <i className="fas fa-envelope me-2" aria-hidden="true"></i>
                    Contact Organization
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="row">
          <div className="col-lg-8">
            {/* About Section */}
            <section className="mb-5">
              <h2 className="h4 mb-3">About {organization.name}</h2>
              <div className="card">
                <div className="card-body">
                  {organization.description ? (
                    <p className="card-text">{organization.description}</p>
                  ) : (
                    <p className="text-muted">No detailed description available.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Photo Gallery Section */}
            <section className="mb-5">
              <h2 className="h4 mb-3">Photo Gallery</h2>
              <div className="card">
                <div className="card-body">
                  {loadingPhotos ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading photos...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading photo gallery...</p>
                    </div>
                  ) : photos && photos.length > 0 ? (
                    <>
                      <div className="row g-3">
                        {photos.map((photo, index) => (
                          <div className="col-md-4 col-6 mb-3" key={index}>
                            <div className="position-relative">
                              <img
                                src={photo.fileIdentifier ? `/api/uploads/${photo.fileIdentifier}` : '/placeholder-image.png'}
                                alt={photo.caption || `${organization.name} photo ${index + 1}`}
                                className="img-fluid rounded shadow-sm"
                                style={{
                                  width: '100%',
                                  height: '180px',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  console.log(`Image error for photo ${index}:`, photo);
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                }}
                              />
                              {photo.caption && (
                                <div className="bg-dark bg-opacity-50 text-white p-1 position-absolute bottom-0 w-100 small">
                                  {photo.caption}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {photos.length > 6 && (
                        <div className="text-center mt-3">
                          <button className="btn btn-outline-primary">View All Photos</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-center text-muted py-4">No photos available for this organization.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Impact Section */}
            {(organization.impact_statistics || organization.beneficiaries_served || organization.years_active || organization.view_count || organization.bookmark_count) && (
              <section className="mb-5">
                <h2 className="h4 mb-3">Our Impact & Statistics</h2>
                <div className="row">
                  {organization.established_year && (
                    <div className="col-md-4 mb-3">
                      <div className="card text-center h-100">
                        <div className="card-body">
                          <h3 className="h2 text-primary mb-1">{new Date().getFullYear() - organization.established_year}</h3>
                          <p className="card-text text-muted">Years of Service</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {organization.beneficiaries_served && (
                    <div className="col-md-4 mb-3">
                      <div className="card text-center h-100">
                        <div className="card-body">
                          <h3 className="h2 text-primary mb-1">{organization.beneficiaries_served.toLocaleString()}</h3>
                          <p className="card-text text-muted">People Served</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {organization.view_count && (
                    <div className="col-md-4 mb-3">
                      <div className="card text-center h-100">
                        <div className="card-body">
                          <h3 className="h2 text-primary mb-1">{organization.view_count.toLocaleString()}</h3>
                          <p className="card-text text-muted">Profile Views</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {organization.bookmark_count !== undefined && organization.bookmark_count !== null && (
                    <div className="col-md-4 mb-3">
                      <div className="card text-center h-100">
                        <div className="card-body">
                          <h3 className="h2 text-primary mb-1">{organization.bookmark_count.toLocaleString()}</h3>
                          <p className="card-text text-muted">Bookmarks</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {organization.impact_statistics && (
                    <div className="col-md-8 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h3 className="h5 text-primary mb-2">Impact Details</h3>
                          <p className="card-text">{organization.impact_statistics}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Contact Form Section */}
            <section id="contact-section" className="mb-5">
              <h2 className="h4 mb-3">Contact {organization.name}</h2>
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleContactSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="contact-name" className="form-label">
                          Your Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="contact-name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="contact-email" className="form-label">
                          Your Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="contact-email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="contact-message" className="form-label">
                        Message <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        id="contact-message"
                        rows="4"
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Tell them about your interest in their work..."
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="btn calcifer-button"
                      disabled={isSubmittingContact}
                    >
                      {isSubmittingContact ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2" aria-hidden="true"></i>
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Contact Information */}
            <section className="mb-4">
              <h2 className="h5 mb-3">Contact Information</h2>
              <div className="card">
                <div className="card-body">
                  {organization.address && (
                    <div className="mb-3">
                      <h3 className="h6 text-muted">Address</h3>
                      <p className="mb-0">
                        <i className="fas fa-map-marker-alt me-2 text-primary" aria-hidden="true"></i>
                        {organization.address}
                      </p>
                    </div>
                  )}

                  {organization.location && (
                    <div className="mb-3">
                      <h3 className="h6 text-muted">Location</h3>
                      <p className="mb-0">
                        <i className="fas fa-globe me-2 text-primary" aria-hidden="true"></i>
                        {formatLocation(organization.location)}
                      </p>
                    </div>
                  )}

                  {organization.phone && (
                    <div className="mb-3">
                      <h3 className="h6 text-muted">Phone</h3>
                      <p className="mb-0">
                        <i className="fas fa-phone me-2 text-primary" aria-hidden="true"></i>
                        <a href={`tel:${organization.phone}`} className="text-decoration-none">
                          {organization.phone}
                        </a>
                      </p>
                    </div>
                  )}

                  {organization.email && (
                    <div className="mb-3">
                      <h3 className="h6 text-muted">Email</h3>
                      <p className="mb-0">
                        <i className="fas fa-envelope me-2 text-primary" aria-hidden="true"></i>
                        <a href={`mailto:${organization.email}`} className="text-decoration-none">
                          {organization.email}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Operating Hours */}
            {organization.operating_hours && (
              <section className="mb-4">
                <h2 className="h5 mb-3">Operating Hours</h2>
                <div className="card">
                  <div className="card-body">
                    <p className="mb-0">
                      <i className="fas fa-clock me-2 text-primary" aria-hidden="true"></i>
                      {organization.operating_hours}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Categories */}
            {organization.categories && organization.categories.length > 0 && (
              <section className="mb-4">
                <h2 className="h5 mb-3">Categories</h2>
                <div className="d-flex flex-wrap gap-2">
                  {organization.categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="badge bg-primary text-decoration-none"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default OrganizationDetail;
