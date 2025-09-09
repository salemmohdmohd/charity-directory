import React from 'react'

const AboutUs = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-ghibli-green text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="display-3 fw-bold mb-4">About Unseen</h1>
              <p className="lead fs-4 mb-4">
                Empowering small and mid-size charities to reach their full potential through
                <span className="text-ghibli-cream fw-semibold"> free digital promotion</span> and expert partnerships
              </p>
              <div className="d-flex justify-content-center gap-4 mt-4">
                <div className="text-center">
                  <h3 className="fw-bold text-ghibli-cream">500+</h3>
                  <small>Charities Listed</small>
                </div>
                <div className="text-center">
                  <h3 className="fw-bold text-ghibli-cream">2M+</h3>
                  <small>People Reached</small>
                </div>
                <div className="text-center">
                  <h3 className="fw-bold text-ghibli-cream">85%</h3>
                  <small>Increased Visibility</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold text-ghibli-green mb-4">Our Mission</h2>
                <p className="lead text-muted fs-5">
                  At Unseen, we believe that every charity, regardless of size or budget, deserves to be discovered by those who share their passion for change.
                </p>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-ghibli-green text-white rounded-circle p-3 me-3">
                          <i className="fas fa-heart fa-lg"></i>
                        </div>
                        <h4 className="mb-0 text-ghibli-green">Free For All</h4>
                      </div>
                      <p className="text-muted">
                        We provide completely free listing and promotion services for small and mid-size charities
                        who lack the budget for expensive digital marketing campaigns.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-ghibli-green text-white rounded-circle p-3 me-3">
                          <i className="fas fa-rocket fa-lg"></i>
                        </div>
                        <h4 className="mb-0 text-ghibli-green">Maximum Impact</h4>
                      </div>
                      <p className="text-muted">
                        Through strategic partnerships with social media experts, SEO specialists, and influencers,
                        we amplify your charity's voice across all digital platforms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold text-ghibli-green mb-4">The Challenge We're Solving</h2>
              </div>

              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="bg-danger text-white rounded-circle p-4 mx-auto mb-3" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <h3 className="mb-0">73%</h3>
                    </div>
                    <h5 className="text-danger">Hidden Charities</h5>
                    <p className="text-muted small">
                      Of small charities struggle with online visibility due to lack of digital marketing expertise
                    </p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="text-center">
                    <div className="bg-warning text-white rounded-circle p-4 mx-auto mb-3" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <h3 className="mb-0">68%</h3>
                    </div>
                    <h5 className="text-warning">Budget Constraints</h5>
                    <p className="text-muted small">
                      Of charities spend less than $500/month on marketing, limiting their reach significantly
                    </p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="text-center">
                    <div className="bg-info text-white rounded-circle p-4 mx-auto mb-3" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <h3 className="mb-0">91%</h3>
                    </div>
                    <h5 className="text-info">Digital Discovery</h5>
                    <p className="text-muted small">
                      Of donors research charities online before making donations, making digital presence crucial
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold text-ghibli-green mb-4">Our Comprehensive Solution</h2>
                <p className="lead text-muted">
                  We've partnered with industry experts to create a powerful ecosystem that amplifies your charity's mission
                </p>
              </div>

              <div className="row g-4">
                <div className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-lg">
                    <div className="card-body p-4 text-center">
                      <div className="mb-3">
                        <i className="fas fa-search text-ghibli-green" style={{fontSize: '3rem'}}></i>
                      </div>
                      <h5 className="card-title text-ghibli-green">SEO Optimization</h5>
                      <p className="card-text text-muted">
                        Our SEO experts ensure your charity appears in top search results when people look for causes like yours.
                      </p>
                      <div className="mt-3">
                        <small className="text-success fw-semibold">
                          <i className="fas fa-arrow-up me-1"></i>
                          Average 300% increase in organic discovery
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-lg">
                    <div className="card-body p-4 text-center">
                      <div className="mb-3">
                        <i className="fab fa-instagram text-ghibli-green" style={{fontSize: '3rem'}}></i>
                      </div>
                      <h5 className="card-title text-ghibli-green">Social Media Mastery</h5>
                      <p className="card-text text-muted">
                        Professional social media strategists create engaging content that resonates with your target audience.
                      </p>
                      <div className="mt-3">
                        <small className="text-success fw-semibold">
                          <i className="fas fa-arrow-up me-1"></i>
                          Average 450% boost in social engagement
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-lg">
                    <div className="card-body p-4 text-center">
                      <div className="mb-3">
                        <i className="fas fa-star text-ghibli-green" style={{fontSize: '3rem'}}></i>
                      </div>
                      <h5 className="card-title text-ghibli-green">Influencer Network</h5>
                      <p className="card-text text-muted">
                        Connect with micro and macro influencers who genuinely care about your cause and can amplify your message.
                      </p>
                      <div className="mt-3">
                        <small className="text-success fw-semibold">
                          <i className="fas fa-arrow-up me-1"></i>
                          Reach millions of engaged followers
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-lg">
                    <div className="card-body p-4 text-center">
                      <div className="mb-3">
                        <i className="fas fa-robot text-ghibli-green" style={{fontSize: '3rem'}}></i>
                      </div>
                      <h5 className="card-title text-ghibli-green">AI Platform Optimization</h5>
                      <p className="card-text text-muted">
                        We ensure your charity is discoverable on emerging AI platforms like ChatGPT, Claude, and other AI assistants.
                      </p>
                      <div className="mt-3">
                        <small className="text-success fw-semibold">
                          <i className="fas fa-arrow-up me-1"></i>
                          Future-proof digital presence
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-lg">
                    <div className="card-body p-4 text-center">
                      <div className="mb-3">
                        <i className="fas fa-chart-line text-ghibli-green" style={{fontSize: '3rem'}}></i>
                      </div>
                      <h5 className="card-title text-ghibli-green">Performance Analytics</h5>
                      <p className="card-text text-muted">
                        Track your charity's digital growth with detailed analytics and actionable insights.
                      </p>
                      <div className="mt-3">
                        <small className="text-success fw-semibold">
                          <i className="fas fa-chart-bar me-1"></i>
                          Data-driven growth strategies
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-lg">
                    <div className="card-body p-4 text-center">
                      <div className="mb-3">
                        <i className="fas fa-shield-alt text-ghibli-green" style={{fontSize: '3rem'}}></i>
                      </div>
                      <h5 className="card-title text-ghibli-green">Quality Assurance</h5>
                      <p className="card-text text-muted">
                        Our dedicated admin team personally verifies each charity to ensure authenticity and mission alignment.
                      </p>
                      <div className="mt-3">
                        <small className="text-success fw-semibold">
                          <i className="fas fa-check-circle me-1"></i>
                          100% verified charitable organizations
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-5 bg-ghibli-green text-white">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="display-5 fw-bold mb-4">The Power of Digital Presence</h2>
              <p className="lead">
                Research shows the incredible impact of strategic digital marketing for charitable organizations
              </p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-donate" style={{fontSize: '3rem'}}></i>
                </div>
                <h3 className="fw-bold text-ghibli-cream">5.2x</h3>
                <p className="mb-0">Increase in online donations when charities have strong SEO presence</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-users" style={{fontSize: '3rem'}}></i>
                </div>
                <h3 className="fw-bold text-ghibli-cream">78%</h3>
                <p className="mb-0">Of people discover new charities through social media recommendations</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-mobile-alt" style={{fontSize: '3rem'}}></i>
                </div>
                <h3 className="fw-bold text-ghibli-cream">84%</h3>
                <p className="mb-0">Of charitable giving research happens on mobile devices</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-clock" style={{fontSize: '3rem'}}></i>
                </div>
                <h3 className="fw-bold text-ghibli-cream">48hrs</h3>
                <p className="mb-0">Average time for viral social content to reach peak engagement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold text-ghibli-green mb-4">How It All Starts</h2>
                <p className="lead text-muted">
                  Your journey to maximum impact begins with a simple step
                </p>
              </div>

              <div className="row g-4">
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="bg-ghibli-green text-white rounded-circle p-4 mx-auto mb-4" style={{width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <h2 className="mb-0">1</h2>
                    </div>
                    <h4 className="text-ghibli-green mb-3">List Your Charity</h4>
                    <p className="text-muted">
                      Submit your charity information through our simple listing form. It takes just 5 minutes to get started.
                    </p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="text-center">
                    <div className="bg-ghibli-green text-white rounded-circle p-4 mx-auto mb-4" style={{width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <h2 className="mb-0">2</h2>
                    </div>
                    <h4 className="text-ghibli-green mb-3">Admin Verification</h4>
                    <p className="text-muted">
                      Our dedicated team personally reviews your submission to ensure authenticity and mission alignment.
                    </p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="text-center">
                    <div className="bg-ghibli-green text-white rounded-circle p-4 mx-auto mb-4" style={{width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <h2 className="mb-0">3</h2>
                    </div>
                    <h4 className="text-ghibli-green mb-3">Global Amplification</h4>
                    <p className="text-muted">
                      Watch as your mission appears everywhere - search engines, social media, AI platforms, and beyond.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-5">
                <a href="/list-your-charity" className="btn calcifer-button btn-lg px-5 py-3 float-magic">
                  <i className="fas fa-rocket me-2"></i>
                  Start Your Journey Today
                </a>
                <p className="text-muted mt-3 small">
                  <i className="fas fa-lock me-1"></i>
                  Completely free • No hidden fees • Verified within 48 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-5 bg-ghibli-green text-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold mb-4 text-ghibli-cream">
                  <i className="fas fa-trophy me-3"></i>
                  Coming Soon: Charity Excellence Awards
                </h2>
                <p className="lead fs-5 mb-4">
                  We're launching an exciting initiative to celebrate and promote outstanding small charities through exclusive in-person events!
                </p>
              </div>

              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="card bg-transparent border-2 border-light h-100">
                    <div className="card-body p-4 text-center">
                      <div className="mb-4">
                        <i className="fas fa-calendar-star text-ghibli-cream" style={{fontSize: '3.5rem'}}></i>
                      </div>
                      <h4 className="text-ghibli-cream mb-3">Quarterly Award Ceremonies</h4>
                      <p className="mb-4">
                        Every three months, we'll host prestigious events recognizing the top-performing small charities
                        based on impact, innovation, and community engagement metrics.
                      </p>
                      <div className="row text-center">
                        <div className="col-6">
                          <h5 className="text-ghibli-cream">Top 10</h5>
                          <small>Charities Awarded</small>
                        </div>
                        <div className="col-6">
                          <h5 className="text-ghibli-cream">$50K+</h5>
                          <small>In Promotion Value</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="card bg-transparent border-2 border-light h-100">
                    <div className="card-body p-4 text-center">
                      <div className="mb-4">
                        <i className="fas fa-microphone-alt text-ghibli-cream" style={{fontSize: '3.5rem'}}></i>
                      </div>
                      <h4 className="text-ghibli-cream mb-3">In-Person Promotion</h4>
                      <p className="mb-4">
                        Award recipients receive premium in-person promotional opportunities including speaking engagements,
                        media interviews, and networking events with major donors and corporate sponsors.
                      </p>
                      <div className="row text-center">
                        <div className="col-6">
                          <h5 className="text-ghibli-cream">500+</h5>
                          <small>Industry Leaders</small>
                        </div>
                        <div className="col-6">
                          <h5 className="text-ghibli-cream">National</h5>
                          <small>Media Coverage</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-5">
                <div className="col-12">
                  <div className="text-center">
                    <h4 className="text-ghibli-cream mb-4">What Award Winners Receive:</h4>
                    <div className="row g-3">
                      <div className="col-md-3 col-6">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-video text-ghibli-cream mb-2" style={{fontSize: '2rem'}}></i>
                          <small>Professional Video Features</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-newspaper text-ghibli-cream mb-2" style={{fontSize: '2rem'}}></i>
                          <small>Press Release Distribution</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-handshake text-ghibli-cream mb-2" style={{fontSize: '2rem'}}></i>
                          <small>Corporate Partnership Intros</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-bullhorn text-ghibli-cream mb-2" style={{fontSize: '2rem'}}></i>
                          <small>Social Media Campaigns</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-5">
                <div className="bg-white bg-opacity-10 rounded-3 p-4 d-inline-block">
                  <h5 className="text-ghibli-cream mb-2">
                    <i className="fas fa-clock me-2"></i>
                    First Event: Spring 2025
                  </h5>
                  <p className="mb-0 small">
                    Applications open February 1st, 2025 • Limited to first 100 applicants
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h2 className="display-5 fw-bold text-ghibli-green mb-4">Ready to Amplify Your Impact?</h2>
              <p className="lead text-muted mb-4">
                Join hundreds of charities that have already transformed their digital presence with Unseen.
                Your mission deserves to be seen by those who care.
              </p>
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                <a href="/list-your-charity" className="btn calcifer-button btn-lg px-4">
                  <i className="fas fa-plus me-2"></i>
                  List Your Charity
                </a>
                <a href="/categories" className="btn btn-outline-secondary btn-lg px-4">
                  <i className="fas fa-search me-2"></i>
                  Explore Charities
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
