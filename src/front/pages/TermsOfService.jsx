import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="py-5 bg-cream" style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-body p-5">
                <h1 className="display-5 fw-bold mb-4 text-center">Terms of Service</h1>
                <p className="text-muted text-center mb-5">
                  Last updated: September 14, 2025
                </p>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">1. Acceptance of Terms</h3>
                  <p className="mb-3">
                    By accessing and using Cause Book ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">2. Description of Service</h3>
                  <p className="mb-3">
                    Cause Book is a platform that connects individuals with charitable organizations. We provide:
                  </p>
                  <ul className="mb-3">
                    <li>A directory of verified charitable organizations</li>
                    <li>Search and filtering capabilities</li>
                    <li>Communication tools between users and organizations</li>
                    <li>Information about charitable causes and impact</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">3. User Responsibilities</h3>
                  <p className="mb-3">
                    As a user of our platform, you agree to:
                  </p>
                  <ul className="mb-3">
                    <li>Provide accurate and truthful information</li>
                    <li>Use the platform for lawful purposes only</li>
                    <li>Respect the privacy and rights of other users</li>
                    <li>Not engage in fraudulent or misleading activities</li>
                    <li>Not attempt to hack or disrupt our services</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">4. Organization Responsibilities</h3>
                  <p className="mb-3">
                    Charitable organizations using our platform must:
                  </p>
                  <ul className="mb-3">
                    <li>Be legally registered as a charitable organization</li>
                    <li>Provide accurate information about their mission and activities</li>
                    <li>Respond promptly to inquiries from potential supporters</li>
                    <li>Maintain their profile with current information</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">5. Content Guidelines</h3>
                  <p className="mb-3">
                    All content posted on our platform must be:
                  </p>
                  <ul className="mb-3">
                    <li>Appropriate and family-friendly</li>
                    <li>Respectful of all individuals and groups</li>
                    <li>Free from hate speech, discrimination, or harassment</li>
                    <li>Accurate and not misleading</li>
                    <li>Original or properly attributed</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">6. Privacy and Data</h3>
                  <p className="mb-3">
                    Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using our service, you consent to our data practices as outlined in our Privacy Policy.
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">7. Disclaimer of Warranties</h3>
                  <p className="mb-3">
                    The information on this platform is provided "as is" without any warranties. While we strive to verify organizations, users should conduct their own due diligence before making donations or commitments.
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">8. Limitation of Liability</h3>
                  <p className="mb-3">
                    Causebook shall not be liable for any damages arising from the use of this platform, including but not limited to direct, indirect, incidental, punitive, and consequential damages.
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">9. Termination</h3>
                  <p className="mb-3">
                    We reserve the right to terminate or suspend accounts that violate these terms or engage in activities that harm the platform or its users.
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="h4 fw-bold mb-3">10. Contact Information</h3>
                  <p className="mb-3">
                    For questions about these Terms of Service, please contact us at:
                  </p>
                  <ul className="list-unstyled">
                    <li><strong>Email:</strong> legal@Causebook.com</li>
                    <li><strong>Address:</strong> Cause Book Legal Team, [Your Address]</li>
                  </ul>
                </div>

                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Important:</strong> These terms may be updated from time to time. Continued use of the platform constitutes acceptance of any changes.
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

export default TermsOfService;
