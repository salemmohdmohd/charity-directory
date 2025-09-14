import React from 'react';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
  return (
    <div className="py-5 bg-cream" style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-body p-5">
                <h1 className="display-5 fw-bold mb-4 text-center">Cookie Policy</h1>
                <p className="text-muted text-center mb-5">
                  Last updated: September 14, 2025
                </p>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">What Are Cookies?</h3>
                  <p className="mb-3">
                    Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and improving our services.
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">Types of Cookies We Use</h3>

                  <div className="mb-4">
                    <h5 className="fw-bold">Essential Cookies</h5>
                    <p className="mb-2">
                      These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas.
                    </p>
                    <ul className="mb-3">
                      <li>Authentication cookies (keep you logged in)</li>
                      <li>Security cookies (protect against attacks)</li>
                      <li>Session cookies (maintain your session)</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h5 className="fw-bold">Functional Cookies</h5>
                    <p className="mb-2">
                      These cookies allow us to remember your preferences and provide enhanced features.
                    </p>
                    <ul className="mb-3">
                      <li>Language preferences</li>
                      <li>Location settings</li>
                      <li>Theme preferences</li>
                      <li>Search history</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h5 className="fw-bold">Analytics Cookies</h5>
                    <p className="mb-2">
                      These cookies help us understand how visitors interact with our website by collecting information anonymously.
                    </p>
                    <ul className="mb-3">
                      <li>Page views and traffic sources</li>
                      <li>User behavior patterns</li>
                      <li>Performance metrics</li>
                      <li>Error tracking</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">Third-Party Cookies</h3>
                  <p className="mb-3">
                    We may use third-party services that also set cookies on your device:
                  </p>
                  <ul className="mb-3">
                    <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                    <li><strong>Social Media:</strong> For social login and sharing features</li>
                    <li><strong>Payment Processors:</strong> For secure donation processing</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">Managing Your Cookies</h3>
                  <p className="mb-3">
                    You can control and manage cookies in several ways:
                  </p>

                  <div className="mb-3">
                    <h5 className="fw-bold">Browser Settings</h5>
                    <p className="mb-2">
                      Most browsers allow you to:
                    </p>
                    <ul className="mb-3">
                      <li>View and delete cookies</li>
                      <li>Block cookies from specific sites</li>
                      <li>Block third-party cookies</li>
                      <li>Clear all cookies when you close the browser</li>
                    </ul>
                  </div>

                  <div className="mb-3">
                    <h5 className="fw-bold">Cookie Consent</h5>
                    <p className="mb-2">
                      When you first visit our site, you can choose which types of cookies to accept through our cookie consent banner.
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">Browser-Specific Instructions</h3>
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="fw-bold">Chrome</h6>
                      <p className="small">Settings → Privacy and Security → Cookies</p>

                      <h6 className="fw-bold">Firefox</h6>
                      <p className="small">Options → Privacy & Security → Cookies</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold">Safari</h6>
                      <p className="small">Preferences → Privacy → Cookies</p>

                      <h6 className="fw-bold">Edge</h6>
                      <p className="small">Settings → Privacy & Security → Cookies</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">Impact of Disabling Cookies</h3>
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>Please note:</strong> Disabling certain cookies may affect the functionality of our website. Some features may not work properly or at all.
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">Updates to This Policy</h3>
                  <p className="mb-3">
                    We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">Contact Us</h3>
                  <p className="mb-3">
                    If you have any questions about our use of cookies, please contact us at:
                  </p>
                  <ul className="list-unstyled">
                    <li><strong>Email:</strong> privacy@Causebook.com</li>
                    <li><strong>Subject:</strong> Cookie Policy Inquiry</li>
                  </ul>
                </div>

                <div className="text-center mt-5">
                  <Link to="/" className="btn btn-primary">
                    Back to Home
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

export default CookiePolicy;
