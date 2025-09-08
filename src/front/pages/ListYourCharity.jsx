import React from 'react'
import { Link } from 'react-router-dom'

const ListYourCharity = () => {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-totoro text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h1 className="display-4 fw-bold mb-3 magical-title">List Your Charity</h1>
              <p className="lead enchanted-text">
                Join our verified network of trusted charitable organizations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-5 sky-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="display-6 fw-bold text-forest">Why List With Us?</h2>
              <p className="lead text-muted">
                Increase your visibility and connect with passionate donors
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center float-magic">
                <div className="bg-totoro text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '4rem', height: '4rem'}}>
                  <i className="fas fa-users fa-lg"></i>
                </div>
                <h4 className="fw-bold text-forest">Reach More Donors</h4>
                <p className="text-muted">
                  Connect with thousands of potential supporters who are passionate about your cause.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center float-magic">
                <div className="bg-totoro text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '4rem', height: '4rem'}}>
                  <i className="fas fa-shield-alt fa-lg"></i>
                </div>
                <h4 className="fw-bold text-forest">Build Trust</h4>
                <p className="text-muted">
                  Our verification process helps build donor confidence in your organization.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center float-magic">
                <div className="bg-totoro text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '4rem', height: '4rem'}}>
                  <i className="fas fa-chart-line fa-lg"></i>
                </div>
                <h4 className="fw-bold text-forest">Track Impact</h4>
                <p className="text-muted">
                  Share your impact stories and show donors how their contributions make a difference.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-5 meadow-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-4">
              <h2 className="display-6 fw-bold mb-4 text-forest">Eligibility Requirements</h2>
              <div className="list-group list-group-flush">
                <div className="list-group-item bg-transparent border-0 px-0">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Registered 501(c)(3) nonprofit organization (US) or equivalent
                </div>
                <div className="list-group-item bg-transparent border-0 px-0">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Minimum 2 years of operation
                </div>
                <div className="list-group-item bg-transparent border-0 px-0">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Current annual report and financial statements
                </div>
                <div className="list-group-item bg-transparent border-0 px-0">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Active board of directors
                </div>
                <div className="list-group-item bg-transparent border-0 px-0">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Clear mission and impact statement
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <h3 className="fw-bold mb-3 text-forest">Application Process</h3>
              <div className="d-flex mb-3">
                <div className="bg-totoro text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '2.5rem', height: '2.5rem', fontSize: '0.875rem'}}>
                  1
                </div>
                <div>
                  <h5 className="fw-bold mb-1 text-forest">Submit Application</h5>
                  <p className="text-muted mb-0">Complete our comprehensive application form with your organization details.</p>
                </div>
              </div>
              <div className="d-flex mb-3">
                <div className="bg-totoro text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '2.5rem', height: '2.5rem', fontSize: '0.875rem'}}>
                  2
                </div>
                <div>
                  <h5 className="fw-bold mb-1 text-forest">Verification Review</h5>
                  <p className="text-muted mb-0">Our team reviews your documents and verifies your nonprofit status.</p>
                </div>
              </div>
              <div className="d-flex mb-3">
                <div className="bg-totoro text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '2.5rem', height: '2.5rem', fontSize: '0.875rem'}}>
                  3
                </div>
                <div>
                  <h5 className="fw-bold mb-1 text-forest">Profile Approval</h5>
                  <p className="text-muted mb-0">Once approved, your charity profile goes live on our platform.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="display-6 fw-bold mb-4 text-forest">Ready to Get Started?</h2>
              <p className="lead mb-4 text-muted">
                Join hundreds of verified charities already making a difference through our platform.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/organization-signup" className="btn calcifer-button btn-lg">
                  Start Application
                </Link>
                <Link to="/organization-login" className="btn btn-outline-secondary btn-lg">
                  Already Registered? Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ListYourCharity
