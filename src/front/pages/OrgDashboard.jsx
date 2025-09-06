import React from 'react';
import useAuth from '../hooks/useAuth';

const OrgDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 mb-1">Organization Dashboard</h1>
              <p className="text-muted mb-0">
                Welcome back, {user?.name || 'Organization Admin'}!
              </p>
            </div>
            <div className="text-end">
              <small className="text-muted">Role: {user?.role}</small>
            </div>
          </div>

          {/* Placeholder content - to be completed by coworker */}
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-building fa-4x text-primary opacity-50"></i>
                  </div>
                  <h3 className="h4 text-muted mb-3">Organization Dashboard</h3>
                  <p className="text-muted mb-4">
                    This dashboard is specifically designed for organization administrators.
                    <br />
                    Content will be implemented by the development team.
                  </p>
                  <div className="row g-3 mt-4">
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="card-title text-muted">Manage Organization</h6>
                          <p className="card-text small text-muted">
                            Edit organization details, upload photos, manage contact information
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="card-title text-muted">View Analytics</h6>
                          <p className="card-text small text-muted">
                            Track views, donations, and engagement metrics
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="card-title text-muted">Manage Content</h6>
                          <p className="card-text small text-muted">
                            Update programs, events, and organizational updates
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TODO: Implement organization-specific features */}
          {/*
            Features to be implemented:
            - Organization profile management
            - Analytics and statistics
            - Content management (programs, events, updates)
            - Donation tracking
            - Volunteer management
            - Document management
            - Communication tools
          */}
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;
