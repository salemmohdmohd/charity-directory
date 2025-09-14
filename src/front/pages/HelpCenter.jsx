import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  const [activeTab, setActiveTab] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = {
    'getting-started': [
      {
        question: "How do I create an account?",
        answer: "Click on the 'Sign Up' button in the top navigation, fill out the required information, and verify your email address to get started."
      },
      {
        question: "Is Cause Book free to use?",
        answer: "Yes! Cause Book is completely free for individuals looking to discover and connect with charitable organizations."
      },
      {
        question: "How do I search for charities?",
        answer: "Use the search bar on our homepage or browse by categories. You can filter results by location, cause area, and organization size."
      }
    ],
    'organizations': [
      {
        question: "How can my organization join Cause Book?",
        answer: "Click 'List Your Charity' and complete the registration process. We'll review your application and verify your organization's status."
      },
      {
        question: "What documents do I need to register?",
        answer: "You'll need your organization's registration number, tax-exempt status documentation, and basic information about your mission and activities."
      },
      {
        question: "How long does verification take?",
        answer: "Our verification process typically takes 3-5 business days. We'll email you once your organization is approved."
      }
    ],
    'donations': [
      {
        question: "Does Cause Book process donations?",
        answer: "No, Cause Book connects you with organizations but doesn't process donations directly. You'll be redirected to the organization's secure donation page."
      },
      {
        question: "Are donations tax-deductible?",
        answer: "Tax-deductibility depends on the organization's status and your local tax laws. Check with each organization for their tax-exempt status."
      },
      {
        question: "Can I track my donation history?",
        answer: "You can bookmark organizations you've supported, but donation tracking is handled by the individual organizations."
      }
    ],
    'technical': [
      {
        question: "Why can't I log in to my account?",
        answer: "Try resetting your password using the 'Forgot Password' link. If issues persist, contact our support team."
      },
      {
        question: "The website is loading slowly. What should I do?",
        answer: "Try clearing your browser cache, disabling browser extensions, or switching to a different browser. Contact us if problems continue."
      },
      {
        question: "How do I delete my account?",
        answer: "Go to your Profile Settings and select 'Delete Account'. Note that this action cannot be undone."
      }
    ]
  };

  const filteredFaqs = searchQuery
    ? Object.values(faqs).flat().filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs[activeTab] || [];

  return (
    <div className="py-5 bg-cream" style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">Help Center</h1>
              <p className="lead text-muted">
                Find answers to common questions and get the help you need
              </p>
            </div>

            {/* Search Bar */}
            <div className="row justify-content-center mb-5">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              {/* Sidebar Navigation */}
              <div className="col-md-3 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Help Topics</h5>
                  </div>
                  <div className="list-group list-group-flush">
                    <button
                      className={`list-group-item list-group-item-action ${activeTab === 'getting-started' ? 'active' : ''}`}
                      onClick={() => {setActiveTab('getting-started'); setSearchQuery('');}}
                    >
                      <i className="fas fa-rocket me-2"></i>
                      Getting Started
                    </button>
                    <button
                      className={`list-group-item list-group-item-action ${activeTab === 'organizations' ? 'active' : ''}`}
                      onClick={() => {setActiveTab('organizations'); setSearchQuery('');}}
                    >
                      <i className="fas fa-building me-2"></i>
                      For Organizations
                    </button>
                    <button
                      className={`list-group-item list-group-item-action ${activeTab === 'donations' ? 'active' : ''}`}
                      onClick={() => {setActiveTab('donations'); setSearchQuery('');}}
                    >
                      <i className="fas fa-heart me-2"></i>
                      Donations & Giving
                    </button>
                    <button
                      className={`list-group-item list-group-item-action ${activeTab === 'technical' ? 'active' : ''}`}
                      onClick={() => {setActiveTab('technical'); setSearchQuery('');}}
                    >
                      <i className="fas fa-cog me-2"></i>
                      Technical Issues
                    </button>
                  </div>
                </div>

                {/* Contact Support */}
                <div className="card mt-4">
                  <div className="card-body text-center">
                    <i className="fas fa-headset fa-2x text-primary mb-3"></i>
                    <h6 className="card-title">Need More Help?</h6>
                    <p className="card-text small text-muted">
                      Can't find what you're looking for? Our support team is here to help.
                    </p>
                    <a href="mailto:support@Causebook.com" className="btn btn-primary btn-sm">
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>

              {/* FAQ Content */}
              <div className="col-md-9">
                <div className="card">
                  <div className="card-body">
                    {searchQuery ? (
                      <div>
                        <h4 className="mb-4">Search Results for "{searchQuery}"</h4>
                        {filteredFaqs.length === 0 ? (
                          <div className="text-center py-5">
                            <i className="fas fa-search fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">No results found</h5>
                            <p className="text-muted">Try different keywords or browse our help topics.</p>
                          </div>
                        ) : (
                          <div className="accordion" id="searchResults">
                            {filteredFaqs.map((faq, index) => (
                              <div key={index} className="accordion-item">
                                <h2 className="accordion-header">
                                  <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#searchAccordion${index}`}
                                  >
                                    {faq.question}
                                  </button>
                                </h2>
                                <div
                                  id={`searchAccordion${index}`}
                                  className="accordion-collapse collapse"
                                  data-bs-parent="#searchResults"
                                >
                                  <div className="accordion-body">
                                    {faq.answer}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h4 className="mb-4">
                          {activeTab === 'getting-started' && 'Getting Started'}
                          {activeTab === 'organizations' && 'For Organizations'}
                          {activeTab === 'donations' && 'Donations & Giving'}
                          {activeTab === 'technical' && 'Technical Issues'}
                        </h4>

                        <div className="accordion" id="faqAccordion">
                          {filteredFaqs.map((faq, index) => (
                            <div key={index} className="accordion-item">
                              <h2 className="accordion-header">
                                <button
                                  className="accordion-button collapsed"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#accordion${index}`}
                                >
                                  {faq.question}
                                </button>
                              </h2>
                              <div
                                id={`accordion${index}`}
                                className="accordion-collapse collapse"
                                data-bs-parent="#faqAccordion"
                              >
                                <div className="accordion-body">
                                  {faq.answer}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="row mt-4">
                  <div className="col-md-4">
                    <div className="card h-100 text-center">
                      <div className="card-body">
                        <i className="fas fa-plus-circle fa-2x text-success mb-3"></i>
                        <h6 className="card-title">List Your Charity</h6>
                        <p className="card-text small">Get your organization on Cause Book</p>
                        <Link to="/list-your-charity" className="btn btn-outline-success btn-sm">
                          Get Started
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card h-100 text-center">
                      <div className="card-body">
                        <i className="fas fa-user-plus fa-2x text-primary mb-3"></i>
                        <h6 className="card-title">Create Account</h6>
                        <p className="card-text small">Join our community of supporters</p>
                        <Link to="/signup" className="btn btn-outline-primary btn-sm">
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card h-100 text-center">
                      <div className="card-body">
                        <i className="fas fa-search fa-2x text-info mb-3"></i>
                        <h6 className="card-title">Browse Charities</h6>
                        <p className="card-text small">Discover organizations near you</p>
                        <Link to="/categories" className="btn btn-outline-info btn-sm">
                          Explore
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
