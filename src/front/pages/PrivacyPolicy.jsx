import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-body p-5">
                <h1 className="display-5 fw-bold mb-4 text-center">Privacy Policy</h1>
                <p className="text-muted text-center mb-5">
                  Last updated: September 13, 2025
                </p>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">1. Information We Collect</h3>
                  <p className="mb-3">
                    At Unseen, we collect information you provide directly to us, such as when you:
                  </p>
                  <ul className="mb-3">
                    <li>Create an account or profile</li>
                    <li>Register your charitable organization</li>
                    <li>Contact organizations through our platform</li>
                    <li>Subscribe to our newsletter</li>
                    <li>Contact us for support</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">2. How We Use Your Information</h3>
                  <p className="mb-3">
                    We use the information we collect to:
                  </p>
                  <ul className="mb-3">
                    <li>Provide, maintain, and improve our services by focusing more on what the collective of people are searching for</li>
                    <li>Connect you with charitable organizations</li>
                    <li>Send you notifications and communications</li>
                    <li>Respond to your comments and questions</li>
                    <li>Prevent fraud and ensure platform security</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">3. Information Sharing</h3>
                  <p className="mb-3">
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information:
                  </p>
                  <ul className="mb-3">
                    <li>With charitable organizations when you contact them</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and the safety of our users</li>
                    <li>With service providers who assist in our operations</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">4. Data Security</h3>
                  <p className="mb-3">
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">5. Your Rights</h3>
                  <p className="mb-3">
                    You have the right to:
                  </p>
                  <ul className="mb-3">
                    <li>Access and update your personal information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Request a copy of your data</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">6. Cookies and Tracking</h3>
                  <p className="mb-3">
                    We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can manage your cookie preferences through your browser settings.
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">7. Contact Us</h3>
                  <p className="mb-3">
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <ul className="list-unstyled">
                    <li><strong>Email:</strong> privacy@unseen.com</li>
                    <li><strong>Address:</strong> Unseen Privacy Team, [Your Address]</li>
                  </ul>
                </div>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Note:</strong> This privacy policy may be updated from time to time. We will notify you of any significant changes by posting the new policy on this page.
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

export default PrivacyPolicy;
