import React, { useState } from 'react';

const Advertise = () => {
    const [formData, setFormData] = useState({
        organizationName: '',
        contactName: '',
        email: '',
        phone: '',
        organizationType: '',
        adPackage: '',
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
            const response = await fetch('/api/advertisements/inquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Inquiry submitted successfully:', result);
                setSubmitted(true);
            } else {
                const error = await response.json();
                console.error('Error submitting inquiry:', error);
                alert('There was an error submitting your inquiry. Please try again.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('There was a network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="totoro-card border-0 shadow-lg text-center p-5">
                            <div className="mb-4">
                                <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h2 className="text-forest mb-3">Thank You!</h2>
                            <p className="lead text-muted mb-4">
                                Your advertising inquiry has been successfully submitted. Our partnerships team will review your request and get back to you within 2-3 business days.
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
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-totoro text-white py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h1 className="display-4 fw-bold mb-3 magical-title">
                                <i className="fas fa-bullhorn me-3"></i>
                                Advertise With Us
                            </h1>
                            <p className="lead enchanted-text">
                                Reach thousands of people who care about making a difference
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Benefits */}
            <section className="py-5 sky-section">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-md-4 mb-4">
                            <div className="float-magic">
                                <i className="fas fa-users text-forest mb-3" style={{ fontSize: '3rem' }}></i>
                                <h4 className="text-forest fw-bold">Engaged Audience</h4>
                                <p className="text-muted">Connect with people actively supporting charities</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="float-magic">
                                <i className="fas fa-chart-line text-forest mb-3" style={{ fontSize: '3rem' }}></i>
                                <h4 className="text-forest fw-bold">Proven Results</h4>
                                <p className="text-muted">Track your success with detailed analytics</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="float-magic">
                                <i className="fas fa-heart text-forest mb-3" style={{ fontSize: '3rem' }}></i>
                                <h4 className="text-forest fw-bold">Purpose-Driven</h4>
                                <p className="text-muted">Partner with a platform focused on social good</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="totoro-card border-0 shadow-lg">
                                <div className="card-header bg-totoro text-white text-center py-4">
                                    <h3 className="mb-0">
                                        <i className="fas fa-envelope me-2"></i>
                                        Get Started Today
                                    </h3>
                                    <p className="mb-0 mt-2 opacity-75">Tell us about your advertising goals</p>
                                </div>
                                <div className="card-body p-5">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="organizationName" className="form-label fw-bold">
                                                    Organization Name *
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
                                                <label htmlFor="contactName" className="form-label fw-bold">
                                                    Your Name *
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
                                                <label htmlFor="email" className="form-label fw-bold">
                                                    Email Address *
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
                                                <label htmlFor="phone" className="form-label fw-bold">
                                                    Phone Number
                                                </label>
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
                                                <label htmlFor="organizationType" className="form-label fw-bold">
                                                    Organization Type *
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
                                                    <option value="nonprofit">Non-Profit</option>
                                                    <option value="charity">Charity</option>
                                                    <option value="foundation">Foundation</option>
                                                    <option value="corporate">Corporate</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="adPackage" className="form-label fw-bold">
                                                    Interested In *
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
                                                    <option value="banner">Banner Advertising</option>
                                                    <option value="featured">Featured Listings</option>
                                                    <option value="newsletter">Newsletter Sponsorship</option>
                                                    <option value="custom">Custom Solution</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="message" className="form-label fw-bold">
                                                Tell Us About Your Goals
                                            </label>
                                            <textarea
                                                className="form-control"
                                                id="message"
                                                name="message"
                                                rows="4"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="What are you hoping to achieve with your advertising? Any specific requirements or questions?"
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
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-paper-plane me-2"></i>
                                                        Send Inquiry
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="text-center mt-3">
                                            <small className="text-muted">
                                                We'll get back to you within 2-3 business days
                                            </small>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Contact Info */}
            <section className="py-4 meadow-section">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h5 className="text-forest mb-3">Have Questions?</h5>
                            <p className="text-muted">
                                Email us at{' '}
                                <a href="mailto:partnerships@unseen.com" className="text-totoro fw-bold">
                                    partnerships@unseen.com
                                </a>
                                {' '}or call{' '}
                                <a href="tel:+1-555-0123" className="text-totoro fw-bold">
                                    (555) 012-3456
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Advertise;
