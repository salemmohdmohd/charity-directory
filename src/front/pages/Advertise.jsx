import React, { useState } from 'react';

const Advertise = () => {
    const [formData, setFormData] = useState({
        organizationName: '',
        contactName: '',
        email: '',
        phone: '',
        organizationType: '',
        website: '',
        adPackage: '',
        budget: '',
        campaignGoals: '',
        targetAudience: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Here you would typically send the data to your backend
            // For now, we'll simulate a successful submission
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-lg">
                            <div className="card-body text-center p-5">
                                <div className="mb-4">
                                    <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                                </div>
                                <h2 className="text-ghibli-green mb-3">Thank You!</h2>
                                <p className="lead text-muted mb-4">
                                    Your advertising inquiry has been successfully submitted. Our team will review your request and get back to you within 2-3 business days.
                                </p>
                                <button
                                    className="btn calcifer-button"
                                    onClick={() => setSubmitted(false)}
                                >
                                    Submit Another Inquiry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            {/* Hero Section */}
            <div className="row mb-5">
                <div className="col-12">
                    <div className="text-center">
                        <h1 className="display-4 fw-bold text-ghibli-green mb-3">
                            <i className="fas fa-bullhorn me-3"></i>
                            Advertise With Unseen
                        </h1>
                        <p className="lead text-muted mb-4">
                            Reach thousands of socially conscious individuals and organizations who care about making a difference.
                        </p>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="row mb-5">
                <div className="col-lg-4 mb-4">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body text-center p-4">
                            <div className="mb-3">
                                <i className="fas fa-target text-ghibli-green" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <h5 className="card-title">Targeted Audience</h5>
                            <p className="card-text text-muted">
                                Connect with engaged users actively seeking charitable organizations and social impact opportunities.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 mb-4">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body text-center p-4">
                            <div className="mb-3">
                                <i className="fas fa-chart-line text-ghibli-green" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <h5 className="card-title">Measurable Results</h5>
                            <p className="card-text text-muted">
                                Track your campaign performance with detailed analytics and engagement metrics.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 mb-4">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body text-center p-4">
                            <div className="mb-3">
                                <i className="fas fa-handshake text-ghibli-green" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <h5 className="card-title">Partnership Focus</h5>
                            <p className="card-text text-muted">
                                We prioritize meaningful partnerships that align with our mission of social good.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ad Packages Section */}
            <div className="row mb-5">
                <div className="col-12">
                    <h2 className="text-center text-ghibli-green mb-4">Our Advertising Packages</h2>
                    <div className="row">
                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="card h-100 border-primary">
                                <div className="card-header bg-primary text-white text-center">
                                    <h6 className="mb-0">Banner Ads</h6>
                                </div>
                                <div className="card-body">
                                    <p className="small text-muted">Strategic placement across high-traffic pages</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="card h-100 border-success">
                                <div className="card-header bg-success text-white text-center">
                                    <h6 className="mb-0">Featured Listings</h6>
                                </div>
                                <div className="card-body">
                                    <p className="small text-muted">Priority placement in search results and categories</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="card h-100 border-warning">
                                <div className="card-header bg-warning text-white text-center">
                                    <h6 className="mb-0">Newsletter Spots</h6>
                                </div>
                                <div className="card-body">
                                    <p className="small text-muted">Reach subscribers through our weekly newsletter</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="card h-100 border-info">
                                <div className="card-header bg-info text-white text-center">
                                    <h6 className="mb-0">Custom Campaigns</h6>
                                </div>
                                <div className="card-body">
                                    <p className="small text-muted">Tailored solutions for specific marketing goals</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-lg">
                        <div className="card-header bg-ghibli-green text-white text-center py-3">
                            <h3 className="mb-0">
                                <i className="fas fa-envelope me-2"></i>
                                Request Advertising Information
                            </h3>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="organizationName" className="form-label">
                                            Organization Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="organizationName"
                                            name="organizationName"
                                            value={formData.organizationName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="contactName" className="form-label">
                                            Contact Person <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="contactName"
                                            name="contactName"
                                            value={formData.contactName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email Address <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="phone" className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="organizationType" className="form-label">
                                            Organization Type <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            id="organizationType"
                                            name="organizationType"
                                            value={formData.organizationType}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            <option value="nonprofit">Non-Profit Organization</option>
                                            <option value="charity">Charity</option>
                                            <option value="foundation">Foundation</option>
                                            <option value="social_enterprise">Social Enterprise</option>
                                            <option value="corporate">Corporate Social Responsibility</option>
                                            <option value="government">Government Agency</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="website" className="form-label">Website URL</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            id="website"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="https://"
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="adPackage" className="form-label">
                                            Interested Package <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            id="adPackage"
                                            name="adPackage"
                                            value={formData.adPackage}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Package</option>
                                            <option value="banner">Banner Ads</option>
                                            <option value="featured">Featured Listings</option>
                                            <option value="newsletter">Newsletter Spots</option>
                                            <option value="custom">Custom Campaign</option>
                                            <option value="multiple">Multiple Packages</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="budget" className="form-label">Monthly Budget Range</label>
                                        <select
                                            className="form-select"
                                            id="budget"
                                            name="budget"
                                            value={formData.budget}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Budget</option>
                                            <option value="under-500">Under $500</option>
                                            <option value="500-1000">$500 - $1,000</option>
                                            <option value="1000-2500">$1,000 - $2,500</option>
                                            <option value="2500-5000">$2,500 - $5,000</option>
                                            <option value="over-5000">Over $5,000</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="campaignGoals" className="form-label">Campaign Goals</label>
                                    <textarea
                                        className="form-control"
                                        id="campaignGoals"
                                        name="campaignGoals"
                                        rows="3"
                                        value={formData.campaignGoals}
                                        onChange={handleChange}
                                        placeholder="What do you hope to achieve with your advertising campaign?"
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="targetAudience" className="form-label">Target Audience</label>
                                    <textarea
                                        className="form-control"
                                        id="targetAudience"
                                        name="targetAudience"
                                        rows="2"
                                        value={formData.targetAudience}
                                        onChange={handleChange}
                                        placeholder="Describe your ideal audience demographics and interests"
                                    ></textarea>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="message" className="form-label">Additional Message</label>
                                    <textarea
                                        className="form-control"
                                        id="message"
                                        name="message"
                                        rows="4"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us more about your organization and advertising needs..."
                                    ></textarea>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        className="btn calcifer-button btn-lg px-5"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane me-2"></i>
                                                Submit Inquiry
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="text-center">
                        <h4 className="text-ghibli-green mb-3">Questions? Get in Touch!</h4>
                        <p className="text-muted">
                            Have questions about our advertising opportunities?
                            Contact our partnerships team at{' '}
                            <a href="mailto:partnerships@unseen.com" className="text-ghibli-green">
                                partnerships@unseen.com
                            </a>
                            {' '}or call us at{' '}
                            <a href="tel:+1-555-0123" className="text-ghibli-green">
                                (555) 012-3456
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Advertise;
