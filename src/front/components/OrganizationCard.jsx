import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../Services/axios';
import useAuth from '../hooks/useAuth';

const OrganizationCard = ({ organization, onCardClick }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(organization.is_bookmarked || false);
  const [bookmarkId, setBookmarkId] = useState(organization.bookmark_id || null);
  const [isLoading, setIsLoading] = useState(false);

  // Debug organization data structure (can be removed in production)
  useEffect(() => {
  // Debug logs removed for production
  }, [organization]);

  useEffect(() => {
    setIsBookmarked(organization.is_bookmarked || false);
    setBookmarkId(organization.bookmark_id || null);
  }, [organization.is_bookmarked, organization.bookmark_id]);

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }
    setIsLoading(true);
    try {
      if (isBookmarked) {
        await userService.removeBookmark(bookmarkId);
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        const response = await userService.addBookmark(organization.id);
        setIsBookmarked(true);
        setBookmarkId(response.bookmark.id);
      }
    } catch (error) {
      console.error('Failed to update bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLocation = (location) => {
    if (!location) return 'Not specified';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      const parts = [location.city, location.state_province, location.country].filter(Boolean);
      return parts.join(', ') || 'Location not available';
    }
    return 'Not specified';
  };

  return (
    <div className="organization-card" onClick={() => onCardClick && onCardClick(organization)}>
      {/* Image Container */}
      <div className="card-img-container">
        <img
          src={`/api/uploads/${organization.primary_photo_url}`}
          alt={organization.name}
          className="card-img-top"
        />
        {organization.is_verified && (
          <div className="verification-badge">
            <i className="fas fa-check-circle me-1"></i>
            Verified
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Logo */}
        <div className="logo-container">
          {organization.logo_url ? (
            <img
              src={`/api/uploads/${organization.logo_url}`}
              alt={`${organization.name} logo`}
              className="logo"
            />
          ) : (
            <div className="logo d-flex align-items-center justify-content-center bg-light">
              <i className="fas fa-landmark text-muted"></i>
            </div>
          )}
        </div>

        {/* Title and Mission */}
        <h5 className="card-title">{organization.name}</h5>
        {organization.status && organization.status !== 'approved' && (
          <div className="badge bg-warning text-dark mb-2">{organization.status.charAt(0).toUpperCase() + organization.status.slice(1)}</div>
        )}
        <p className="card-mission">
          {organization.mission ? (organization.mission.length > 100 ? `${organization.mission.substring(0, 100)}...` : organization.mission) : 'Mission not available.'}
        </p>

        {/* Info Grid */}
        <div className="info-grid">
          <div className="info-item">
            <i className="fas fa-tag"></i>
            <span>{organization.category_name || organization.category || 'Uncategorized'}</span>
          </div>
          <div className="info-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>{formatLocation(organization.location || organization.address)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions">
          <button className="btn btn-primary btn-sm btn-action" onClick={() => onCardClick && onCardClick(organization)}>
            Learn More
          </button>
          <button
            className={`btn btn-sm ${isBookmarked ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={handleBookmarkToggle}
            disabled={isLoading}
            title={isBookmarked ? 'Remove from Bookmarks' : 'Add to Bookmarks'}
          >
            <i className={`fas fa-heart ${isLoading ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCard;
