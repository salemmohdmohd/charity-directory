import React from 'react';

const OrganizationCard = ({ organization, categoryColorCode, onCardClick, onWebsiteClick }) => {
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

  return (
    <div
      className="totoro-card h-100"
      style={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        borderLeft: `4px solid ${categoryColorCode || '#28a745'}`,
        minWidth: '280px',
        maxWidth: '350px',
        minHeight: '420px',
        width: '100%'
      }}
      onClick={() => onCardClick && onCardClick(organization)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      }}
    >
      {/* Organization Photo Section */}
      <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
        {organization.photos && organization.photos.length > 0 ? (
          <>
            <img
              src={organization.photos.find(p => p.is_primary)?.file_path || organization.photos[0]?.file_path}
              alt={organization.photos.find(p => p.is_primary)?.alt_text || `${organization.name} photo`}
              className="card-img-top"
              style={{
                height: '200px',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onError={(e) => {
                // If image fails to load, show placeholder
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
            {/* Fallback placeholder (hidden by default) */}
            <div
              className="d-flex align-items-center justify-content-center bg-light"
              style={{
                height: '200px',
                display: 'none',
                color: '#6c757d'
              }}
            >
              <div className="text-center">
                <i className="fas fa-image" style={{ fontSize: '3rem', marginBottom: '10px' }}></i>
                <div>No Image Available</div>
              </div>
            </div>
          </>
        ) : (
          /* Placeholder when no photos exist */
          <div
            className="d-flex align-items-center justify-content-center bg-light"
            style={{
              height: '200px',
              color: '#6c757d'
            }}
          >
            <div className="text-center">
              <i className="fas fa-image" style={{ fontSize: '3rem', marginBottom: '10px' }}></i>
              <div>No Image Available</div>
            </div>
          </div>
        )}

        {/* Verification Badge Overlay */}
        {organization.verification_status === 'verified' && (
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-success">
              <i className="fas fa-check-circle me-1" aria-hidden="true"></i>
              Verified
            </span>
          </div>
        )}
      </div>

      <div className="card-body p-4">
        {/* Organization Header with Logo */}
        <div className="d-flex align-items-start mb-3">
          <div className="me-3">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={`${organization.name} logo`}
                className="rounded border"
                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="bg-light border rounded d-flex align-items-center justify-content-center"
                style={{ width: '50px', height: '50px' }}
              >
                <i className="fas fa-heart text-muted" style={{ fontSize: '1.2rem' }}></i>
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <h5 className="card-title text-forest fw-bold mb-2">
              {organization.name}
            </h5>

            {/* Verification Badges */}
            <div className="d-flex flex-wrap gap-1 mb-2">
              {/* Only show verification badge if no photo is present */}
              {organization.verification_status === 'verified' && (!organization.photos || organization.photos.length === 0) && (
                <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                  <i className="fas fa-check-circle me-1" aria-hidden="true"></i>
                  Verified
                </span>
              )}

              {organization.established_year && (
                <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                  <i className="fas fa-calendar me-1" aria-hidden="true"></i>
                  Est. {organization.established_year}
                </span>
              )}
            </div>
          </div>
        </div>

        {organization.mission && (
          <p className="card-text text-muted mb-3" style={{ fontSize: '0.9rem' }}>
            {organization.mission.length > 120
              ? `${organization.mission.substring(0, 120)}...`
              : organization.mission
            }
          </p>
        )}

        {/* Quick Stats */}
        {(organization.beneficiaries_served || organization.view_count) && (
          <div className="row text-center mb-3">
            {organization.beneficiaries_served && (
              <div className="col-6">
                <small className="text-muted d-block">People Served</small>
                <strong className="text-forest">{organization.beneficiaries_served.toLocaleString()}</strong>
              </div>
            )}
            {organization.view_count && (
              <div className="col-6">
                <small className="text-muted d-block">Profile Views</small>
                <strong className="text-forest">{organization.view_count.toLocaleString()}</strong>
              </div>
            )}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">
            <i className="fas fa-map-marker-alt me-1"></i>
            Location
          </small>
          <small className="text-forest fw-bold">
            {formatLocation(organization.location)}
          </small>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <small className="text-muted">
            <i className="fas fa-shield-check me-1"></i>
            Status
          </small>
          <span className={`badge ${
            organization.verification_level === 'verified' ? 'bg-forest' :
            organization.verification_level === 'pending' ? 'bg-sunset' : 'bg-sky'
          }`}>
            {organization.verification_level || 'pending'}
          </span>
        </div>

        <div className="d-flex gap-2">
          <button className="btn calcifer-button btn-sm flex-fill">
            <i className="fas fa-info-circle me-1"></i>
            Learn More
          </button>

          {organization.donation_link && (
            <button
              className="btn btn-success btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(organization.donation_link, '_blank');
              }}
              title="Donate to this organization"
            >
              <i className="fas fa-heart"></i>
            </button>
          )}

          {organization.website && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                if (onWebsiteClick) {
                  onWebsiteClick(organization.website);
                } else {
                  window.open(organization.website, '_blank');
                }
              }}
              title="Visit website"
            >
              <i className="fas fa-external-link-alt"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationCard;
