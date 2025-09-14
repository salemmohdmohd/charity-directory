import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { api } from '../Services/axios';
import { Link } from 'react-router-dom';

// Calculate profile completeness percentage
const calculateProfileCompleteness = (organization) => {
  if (!organization) return 0;

  const requiredFields = [
    'name', 'mission', 'description', 'email', 'phone', 'website',
    'logo_url', 'address', 'category_id'
  ];

  let completedFields = 0;
  requiredFields.forEach(field => {
    if (organization[field]) completedFields++;
  });

  return Math.round((completedFields / requiredFields.length) * 100);
};

// Calculate days the organization has been active
const getDaysActive = (createdAt) => {
  if (!createdAt) return 0;

  const created = new Date(createdAt);
  const today = new Date();
  const diffTime = Math.abs(today - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

const OrgDashboard = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Simple validation helper
  const runValidation = (state) => {
    const errors = {};
    if (!state || !state.name || state.name.trim().length === 0) errors.name = 'Name is required';
    // email required and basic format
    const email = state?.email || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) errors.email = 'Email is required';
    else if (!emailRegex.test(email)) errors.email = 'Please enter a valid email address';
    // category required
    if (!state?.category_id) errors.category_id = 'Please select a category';
    // website optional but if present, must be a valid URL
    if (state?.website) {
      try {
        // eslint-disable-next-line no-new
        new URL(state.website);
      } catch (e) {
        errors.website = 'Website must be a valid URL (include protocol, e.g. https://)';
      }
    }
    return errors;
  };

  // Fetch categories when entering edit mode (or on mount)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/org-signup/categories');
        if (res?.data?.categories) setCategories(res.data.categories);
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    };
    if (editMode && categories.length === 0) fetchCategories();
  }, [editMode]);

  // Re-run validation when formState changes while editing
  useEffect(() => {
    if (editMode && formState) {
      setFormErrors(runValidation(formState));
    }
  }, [formState, editMode]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!user) {
        console.log("User data not available yet");
        return;
      }

      try {
        setLoading(true);
        console.log("User data:", user);

        // Try to get organization ID from user object
        let orgId = user.organization_id;

        if (!orgId) {
          console.log("No organization_id found in user object. Attempting to fetch directly.");
          // Try to get user's organizations
          try {
            const myOrgsResponse = await api.get('/users/me/organizations');
            console.log("User's organizations:", myOrgsResponse.data);
            if (myOrgsResponse.data.organizations && myOrgsResponse.data.organizations.length > 0) {
              // Use the first organization found
              orgId = myOrgsResponse.data.organizations[0].id;
              console.log("Found organization ID:", orgId);
            }
          } catch (orgError) {
            console.error("Failed to get user's organizations:", orgError);
          }
        }

        if (!orgId) {
          setError("Could not find an associated organization for your account. Please contact support if this is unexpected.");
          setLoading(false);
          return;
        }

        // Fetch the organization details
        console.log(`Fetching organization data for ID: ${orgId}`);
        const response = await api.get(`/organizations/${orgId}`);
        console.log("Organization data received:", response.data);

        setOrganization(response.data);
        setError(null);

        // Fetch organization photos separately
        setLoadingPhotos(true);
        try {
          console.log(`Fetching photos for organization ID: ${orgId}`);
          const photosResponse = await api.get(`/organizations/${orgId}/photos`);
          console.log("Organization photos received:", photosResponse.data);

          // Process photos to ensure we have valid file identifiers
          const validPhotos = Array.isArray(photosResponse.data)
            ? photosResponse.data.map(photo => {
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

          // If we have a logo_url, use it as a fallback photo
          if (response.data.logo_url) {
            console.log('Using logo as fallback photo');
            setPhotos([{
              id: 'logo',
              fileIdentifier: response.data.logo_url,
              caption: `${response.data.name} Logo`
            }]);
          } else {
            setPhotos([]);
          }
        } finally {
          setLoadingPhotos(false);
        }
      } catch (err) {
        console.error("Failed to fetch organization data:", err);
        setError(`Failed to fetch organization data: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrganizationData();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success">Approved</span>;
      case 'pending':
        return <span className="badge bg-warning text-dark">Pending Review</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!organization) {
     return (
      <div className="container py-4">
        <div className="alert alert-warning">No organization data available. If you just registered, it might still be processing.</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          {!editMode ? (
            <>
              <h1 className="h2 mb-1">{organization.name}</h1>
              <p className="text-muted mb-0">Welcome back, {user?.name || 'Admin'}!</p>
            </>
          ) : (
            <>
              <h1 className="h2 mb-1">Editing: {formState?.name || ''}</h1>
              <p className="text-muted mb-0">You are editing the listing. Saving will set the listing status to <strong>Pending</strong> for admin review.</p>
            </>
          )}
        </div>

          <div>
            {user && user.organization_id && organization && user.organization_id === organization.id && (
              !editMode ? (
                <button className="btn btn-outline-primary" onClick={() => { setFormState({
                  name: organization.name,
                  mission: organization.mission,
                  description: organization.description,
                  email: organization.email,
                  phone: organization.phone,
                  website: organization.website,
                  address: organization.address,
                  category_id: organization.category_id
                }); setEditMode(true); setSaveMessage(null); }}>
                  <i className="fas fa-edit me-1" /> Edit Listing
                </button>
              ) : (
                <>
                  <button className="btn btn-success me-2" onClick={async () => {
                    // Validate first
                    const errors = runValidation(formState);
                    if (Object.keys(errors).length > 0) {
                      setFormErrors(errors);
                      setSaveMessage('Please fix validation errors before saving.');
                      return;
                    }

                    // Save changes
                    setSaving(true);
                    setSaveMessage(null);
                    try {
                      const payload = {
                        ...formState,
                        status: 'pending'
                      };
                      const res = await api.patch(`/organizations/${organization.id}`, payload);
                      // Update local state with response (server should return updated org)
                      setOrganization(res.data);
                      setEditMode(false);
                      setSaveMessage('Changes saved — listing set to pending review.');
                    } catch (err) {
                      console.error('Failed to save organization changes:', err);
                      setSaveMessage(`Failed to save changes: ${err?.response?.data?.message || err.message || 'Unknown error'}`);
                    } finally {
                      setSaving(false);
                    }
                  }} disabled={saving}>
                    {saving ? 'Saving...' : <><i className="fas fa-save me-1"/> Save</>}
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => { setEditMode(false); setFormState(null); setSaveMessage(null); }} disabled={saving}>
                    Cancel
                  </button>
                </>
              )
            )}
          </div>
      </div>

      {/* Main Content */}
      <div className="row g-4">
        {/* Organization Overview Card */}
        <div className="col-12">
          <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center bg-light">
              <h5 className="mb-0">Organization Overview</h5>
              <div>
                <span className="me-2">Status:</span>
                {getStatusBadge(organization.status)}
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center">
                  <img
                    src={organization.logo_url ? `/api/uploads/${organization.logo_url}` : '/placeholder-logo.png'}
                    alt={`${organization.name} Logo`}
                    className="img-fluid rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                </div>
                <div className="col-md-8">
                  <h6 className="text-muted">Mission</h6>
                  {!editMode ? (
                    <p>{organization.mission}</p>
                  ) : (
                    <textarea className="form-control mb-2" rows={3} value={formState.mission || ''} onChange={(e) => setFormState({...formState, mission: e.target.value })} />
                  )}
                  <hr/>
                  <div className="row">
                    <div className="col-sm-6 mb-2">
                      <strong>Name:</strong>
                      {!editMode ? (
                        <div>{organization.name}</div>
                      ) : (
                        <>
                          <input className="form-control" value={formState.name || ''} onChange={(e) => setFormState({...formState, name: e.target.value })} />
                          {formErrors.name && <div className="text-danger small mt-1">{formErrors.name}</div>}
                        </>
                      )}
                    </div>

                    <div className="col-sm-6 mb-2">
                      <strong>Email:</strong>
                      {!editMode ? (
                        <div><a href={`mailto:${organization.email}`}>{organization.email}</a></div>
                      ) : (
                        <>
                          <input className="form-control" type="email" value={formState.email || ''} onChange={(e) => setFormState({...formState, email: e.target.value })} />
                          {formErrors.email && <div className="text-danger small mt-1">{formErrors.email}</div>}
                        </>
                      )}
                    </div>

                    <div className="col-sm-6 mb-2">
                      <strong>Phone:</strong>
                      {!editMode ? (
                        <div>{organization.phone || 'N/A'}</div>
                      ) : (
                        <input className="form-control" value={formState.phone || ''} onChange={(e) => setFormState({...formState, phone: e.target.value })} />
                      )}
                    </div>

                    <div className="col-sm-6 mb-2">
                      <strong>Website:</strong>
                      {!editMode ? (
                        <div>{organization.website ? (<a href={organization.website} target="_blank" rel="noopener noreferrer">{organization.website}</a>) : 'N/A'}</div>
                      ) : (
                        <>
                          <input className="form-control" value={formState.website || ''} onChange={(e) => setFormState({...formState, website: e.target.value })} />
                          {formErrors.website && <div className="text-danger small mt-1">{formErrors.website}</div>}
                        </>
                      )}
                    </div>

                    <div className="col-sm-12 mb-2">
                      <strong>Address:</strong>
                      {!editMode ? (
                        <div>{organization.address || 'N/A'}</div>
                      ) : (
                        <input className="form-control" value={formState.address || ''} onChange={(e) => setFormState({...formState, address: e.target.value })} />
                      )}
                    </div>

                    <div className="col-sm-6 mb-2">
                      <strong>Category:</strong>
                      {!editMode ? (
                        <div>{organization.category_name || 'N/A'}</div>
                      ) : (
                        <>
                          <select className="form-select" value={formState.category_id || ''} onChange={(e) => setFormState({...formState, category_id: e.target.value })}>
                            <option value="">-- Select category --</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          {formErrors.category_id && <div className="text-danger small mt-1">{formErrors.category_id}</div>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
           <div className="card shadow-sm mb-4">
             <div className="card-header bg-light">
                <h5 className="mb-0">Profile Analytics</h5>
             </div>
             <div className="card-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="card border-0 bg-light h-100">
                      <div className="card-body text-center">
                        <div className="d-inline-flex justify-content-center align-items-center bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
                          <i className="fas fa-eye text-primary fa-2x"></i>
                        </div>
                        <h3 className="h2 mb-0">{organization.view_count?.toLocaleString() || '0'}</h3>
                        <p className="text-muted mb-0">Profile Views</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="card border-0 bg-light h-100">
                      <div className="card-body text-center">
                        <div className="d-inline-flex justify-content-center align-items-center bg-success bg-opacity-10 p-3 rounded-circle mb-3">
                          <i className="fas fa-bookmark text-success fa-2x"></i>
                        </div>
                        <h3 className="h2 mb-0">{organization.bookmark_count?.toLocaleString() || '0'}</h3>
                        <p className="text-muted mb-0">Bookmarks</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="card border-0 bg-light h-100">
                      <div className="card-body text-center">
                        <div className="d-inline-flex justify-content-center align-items-center bg-info bg-opacity-10 p-3 rounded-circle mb-3">
                          <i className="fas fa-envelope text-info fa-2x"></i>
                        </div>
                        <h3 className="h2 mb-0">{organization.contact_count?.toLocaleString() || '0'}</h3>
                        <p className="text-muted mb-0">Contact Inquiries</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional metrics row */}
                <div className="row mt-2">
                  <div className="col-md-6 mb-3">
                    <div className="card border-0 h-100">
                      <div className="card-body">
                        <h6 className="text-muted mb-3">Profile Completion</h6>
                        <div className="d-flex align-items-center mb-1">
                          <div className="flex-grow-1">
                            <div className="progress" style={{height: '8px'}}>
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{
                                  width: `${calculateProfileCompleteness(editMode ? formState : organization)}%`
                                }}
                                aria-valuenow={calculateProfileCompleteness(editMode ? formState : organization)}
                                aria-valuemin="0"
                                aria-valuemax="100">
                              </div>
                            </div>
                          </div>
                          <div className="ms-3 text-primary fw-bold">
                            {calculateProfileCompleteness(editMode ? formState : organization)}%
                          </div>
                        </div>
                        <p className="small text-muted mb-0">
                          Complete your profile to increase visibility
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="card border-0 h-100">
                      <div className="card-body">
                        <h6 className="text-muted mb-2">Active Since</h6>
                        <div className="d-flex align-items-center">
                          <div className="d-inline-flex justify-content-center align-items-center bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                            <i className="fas fa-calendar text-warning"></i>
                          </div>
                          <div>
                            <span className="h5 mb-0">
                              {organization.created_at ?
                                new Date(organization.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) :
                                'N/A'}
                            </span>
                            <p className="small text-muted mb-0">
                              {organization.created_at ?
                                `${getDaysActive(organization.created_at)} days` :
                                'Date not available'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {saveMessage && (
                    <div className="mt-2">
                      <div className={`alert ${saveMessage.startsWith('Failed') ? 'alert-danger' : 'alert-success'}`}>{saveMessage}</div>
                    </div>
                  )}
                </div>
             </div>
           </div>

           {/* Photo Gallery Section */}
           <div className="card shadow-sm mb-4">
             <div className="card-header bg-light d-flex justify-content-between align-items-center">
               <h5 className="mb-0">Organization Gallery</h5>
               <button className="btn btn-sm btn-outline-primary">
                 <i className="fas fa-plus me-1"></i> Add Photos
               </button>
             </div>
             <div className="card-body">
               <div className="row g-3">
                 {loadingPhotos ? (
                   <div className="col-12 text-center py-4">
                     <div className="spinner-border spinner-border-sm text-primary" role="status">
                       <span className="visually-hidden">Loading photos...</span>
                     </div>
                     <p className="mt-2 text-muted">Loading photo gallery...</p>
                   </div>
                 ) : photos && photos.length > 0 ? (
                   photos.map((photo, index) => (
                     <div key={photo.id || index} className="col-md-4 col-sm-6">
                       <div className="position-relative gallery-item">
                         <img
                           src={`/api/uploads/${photo.fileIdentifier}`}
                           alt={photo.caption || `Gallery photo ${index + 1}`}
                           className="img-fluid rounded shadow-sm"
                           style={{width: '100%', height: '180px', objectFit: 'cover'}}
                           onError={(e) => {
                             console.log(`Image error for photo ${index}:`, photo);
                             e.target.onerror = null;
                             e.target.src = '/placeholder-image.png';
                           }}
                         />
                         {photo.caption && (
                           <div className="bg-dark bg-opacity-50 text-white p-1 position-absolute bottom-0 w-100 small">
                             {photo.caption}
                           </div>
                         )}
                         <div className="gallery-overlay d-flex justify-content-center align-items-center">
                           <button className="btn btn-sm btn-light me-2">
                             <i className="fas fa-eye"></i>
                           </button>
                           <button className="btn btn-sm btn-danger">
                             <i className="fas fa-trash"></i>
                           </button>
                         </div>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="col-12 text-center py-5">
                     <div className="text-muted">
                       <i className="fas fa-images fa-3x mb-3"></i>
                       <h6>No photos yet</h6>
                       <p className="mb-0 small">Add photos to showcase your organization's work and impact.</p>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           </div>
        </div>

        {/* Status notification */}
        {organization.status === 'pending' && (
          <div className="col-12 mb-4">
            <div className="alert alert-info">
              <h6 className="alert-heading">Your submission is under review.</h6>
              <p className="mb-0 small">You will be notified once your organization has been approved. You can still edit your profile information.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgDashboard;