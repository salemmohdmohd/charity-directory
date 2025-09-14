import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { api } from '../Services/axios';

const UserProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Use the currently authenticated user data from the hook
        // This avoids making an unnecessary API call if we already have the data
  setProfileData(user);

        // Fetch organizations and bookmarks in parallel (if needed)
        const promises = [];
        promises.push(api.get('/users/me/organizations').catch(() => ({ data: { organizations: [] } })));
        promises.push(api.get('/users/me/bookmarks').catch(() => ({ data: [] })));
        const [orgsResponse, bookmarksResponse] = await Promise.all(promises);

        if (orgsResponse && orgsResponse.data && Array.isArray(orgsResponse.data.organizations)) {
          setOrganizations(orgsResponse.data.organizations);
        } else {
          setOrganizations([]);
        }

        // Normalize bookmarks response shape
        if (bookmarksResponse && Array.isArray(bookmarksResponse.data)) {
          setBookmarks(bookmarksResponse.data);
        } else if (bookmarksResponse && bookmarksResponse.data && Array.isArray(bookmarksResponse.data.bookmarks)) {
          setBookmarks(bookmarksResponse.data.bookmarks);
        } else {
          setBookmarks([]);
        }

  setError(null);
      } catch (err) {
  setError('Failed to load user profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          No profile data available. Please sign in to view your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-4 mb-4">
          {/* User Profile Card */}
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                {profileData.avatar_url ? (
                  <img
                    src={`/api/uploads/${profileData.avatar_url}`}
                    alt="User Avatar"
                    className="rounded-circle"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-inline-flex justify-content-center align-items-center"
                    style={{ width: '120px', height: '120px' }}
                  >
                    <i className="fas fa-user text-primary" style={{ fontSize: '3rem' }}></i>
                  </div>
                )}
              </div>
              <h5 className="card-title mb-1">{profileData.name}</h5>
              <p className="text-muted small mb-3">
                <span className="badge bg-secondary me-1">{profileData.role}</span>
                {profileData.is_verified && <span className="badge bg-success">Verified</span>}
              </p>
              <div className="d-grid gap-2">
                <Link to="/edit-profile" className="btn btn-outline-primary">
                  <i className="fas fa-edit me-1"></i> Edit Profile
                </Link>
              </div>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span><i className="fas fa-envelope me-2 text-secondary"></i> Email</span>
                <span>{profileData.email}</span>
              </li>
              {profileData.phone && (
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span><i className="fas fa-phone me-2 text-secondary"></i> Phone</span>
                  <span>{profileData.phone}</span>
                </li>
              )}
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span><i className="fas fa-calendar me-2 text-secondary"></i> Joined</span>
                <span>
                  {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-lg-8">
          {/* Organizations Section */}
          {(profileData.role === 'org_admin' || profileData.role === 'platform_admin') && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">My Organizations</h5>
              </div>
              <div className="card-body">
                {organizations.length > 0 ? (
                  <div className="list-group">
                    {organizations.map(org => (
                      <div key={org.id} className="list-group-item list-group-item-action d-flex align-items-center">
                        <div className="me-3">
                          {org.logo_url ? (
                            <img
                              src={`/api/uploads/${org.logo_url}`}
                              alt={`${org.name} logo`}
                              className="rounded"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="bg-light rounded d-flex align-items-center justify-content-center"
                              style={{ width: '50px', height: '50px' }}
                            >
                              <i className="fas fa-building text-secondary"></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{org.name}</h6>
                          <p className="mb-0 small text-muted">
                            {org.status === 'approved' ? (
                              <span className="text-success">
                                <i className="fas fa-check-circle me-1"></i> Approved
                              </span>
                            ) : (
                              <span className="text-warning">
                                <i className="fas fa-clock me-1"></i> {org.status}
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <Link to={`/organization-dashboard`} className="btn btn-sm btn-outline-primary">
                            <i className="fas fa-tachometer-alt me-1"></i> Dashboard
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted py-3">
                    You don't have any organizations yet.
                    <br />
                    <Link to="/register-organization" className="btn btn-sm btn-primary mt-2">
                      <i className="fas fa-plus me-1"></i> Register Organization
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Activity Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">My Activity</h5>
            </div>
            <div className="card-body">
              <ul className="list-group">
                {bookmarks && bookmarks.length > 0 ? (
                  bookmarks.map((bookmark, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <i className="fas fa-bookmark text-primary me-2"></i>
                        <span>Bookmarked: </span>
                        {(() => {
                          const id = bookmark.id || bookmark.organization_id;
                          const name = bookmark.name || bookmark.organization_name || `organization-${id}`;
                          const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                          return (
                            <Link to={`/organizations/${id}-${slug}`}>
                              {name}
                            </Link>
                          );
                        })()}
                      </div>
                      <span className="text-muted small">
                        {(bookmark.bookmarked_at || bookmark.created_at) ? new Date(bookmark.bookmarked_at || bookmark.created_at).toLocaleDateString() : ''}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-center py-4">
                    <p className="text-muted mb-0">No recent activity</p>
                    <Link to="/categories" className="btn btn-sm btn-outline-primary mt-2">
                      <i className="fas fa-search me-1"></i> Browse Organizations
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Account Settings Quick Access */}
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Account Settings</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <Link to="/edit-profile" className="btn btn-outline-secondary w-100">
                    <i className="fas fa-user-edit me-2"></i> Update Profile
                  </Link>
                </div>
                <div className="col-md-6">
                  <Link to="/change-password" className="btn btn-outline-secondary w-100">
                    <i className="fas fa-key me-2"></i> Change Password
                  </Link>
                </div>
                <div className="col-md-6">
                  <Link to="/notification-preferences" className="btn btn-outline-secondary w-100">
                    <i className="fas fa-bell me-2"></i> Notification Settings
                  </Link>
                </div>
                <div className="col-md-6">
                  <Link to="/privacy-settings" className="btn btn-outline-secondary w-100">
                    <i className="fas fa-shield-alt me-2"></i> Privacy Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
