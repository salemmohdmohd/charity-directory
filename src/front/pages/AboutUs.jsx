import React from 'react'
import { Link } from 'react-router-dom'

const AboutUs = () => {
  return (
    <div>
      {/* Enhanced Hero Section */}
      <header
        className="bg-ghibli-green text-white text-center py-5 d-flex align-items-center hero-ghibli"
        style={{
          background: 'linear-gradient(135deg, #3a6b47 0%, #4a7c59 50%, #224010 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '500px',
          textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7), 1px 1px 4px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="container">
          <h1 className="display-2 fw-bold mb-3 magical-title" style={{textShadow: '3px 3px 10px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(74, 124, 89, 0.4)'}}>
            About Unseen
          </h1>
          <p className="lead fw-bold mb-4 enchanted-text fs-3" style={{textShadow: '2px 2px 6px rgba(0, 0, 0, 0.7), 1px 1px 3px rgba(74, 124, 89, 0.3)'}}>
            Empowering small and mid-size charities to reach their full potential through
            <span className=" fw-semibold"> free digital promotion</span> and expert partnerships
          </p>

          <div className="row justify-content-center mt-5">
            <div className="col-md-3 col-6 mb-4 mb-md-0">
              <div className="bg-white bg-opacity-25 rounded-4 p-3 transform-hover">
                <h2 className="fw-bold  display-4 mb-0">500+</h2>
                <p className="mb-0 fw-semibold">Charities Listed</p>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-4 mb-md-0">
              <div className="bg-white bg-opacity-25 rounded-4 p-3 transform-hover">
                <h2 className="fw-bold  display-4 mb-0">2M+</h2>
                <p className="mb-0 fw-semibold">People Reached</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="bg-white bg-opacity-25 rounded-4 p-3 transform-hover">
                <h2 className="fw-bold  display-4 mb-0">85%</h2>
                <p className="mb-0 fw-semibold">Increased Visibility</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Link to="/list-your-charity" className="btn calcifer-button btn-lg float-magic px-4 py-3 me-3">
              <i className="fas fa-plus-circle me-2"></i> List Your Charity
            </Link>
            <Link to="/categories" className="btn btn-outline-light btn-lg px-4 py-3">
              <i className="fas fa-search me-2"></i> Explore Categories
            </Link>
          </div>
        </div>
      </header>

      {/* Enhanced Mission Statement */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold text-ghibli-green mb-3 magical-title">Our Mission</h2>
                <div className="position-relative d-inline-block mb-4">
                  <span className="position-absolute" style={{
                    height: '4px',
                    width: '60%',
                    backgroundColor: 'rgba(74, 124, 89, 0.4)',
                    bottom: '-10px',
                    left: '20%'
                  }}></span>
                </div>
                <p className="lead text-muted fs-4 enchanted-text">
                  At Unseen, we believe that every charity, regardless of size or budget, deserves to be discovered by those who share their passion for change.
                </p>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-lg rounded-4 transform-hover">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-ghibli-green text-white rounded-circle p-3 me-3 shadow-sm">
                          <i className="fas fa-heart fa-lg"></i>
                        </div>
                        <h4 className="mb-0 text-ghibli-green fw-bold">Free For All</h4>
                      </div>
                      <p className="text-muted fs-5">
                        We provide completely free listing and promotion services for small and mid-size charities
                        who lack the budget for expensive digital marketing campaigns.
                      </p>
                      <div className="mt-4 text-end">
                        <Link to="/list-your-charity" className="text-ghibli-green fw-semibold text-decoration-none">
                          Get Listed <i className="fas fa-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-lg rounded-4 transform-hover">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-ghibli-green text-white rounded-circle p-3 me-3 shadow-sm">
                          <i className="fas fa-rocket fa-lg"></i>
                        </div>
                        <h4 className="mb-0 text-ghibli-green fw-bold">Maximum Impact</h4>
                      </div>
                      <p className="text-muted fs-5">
                        Through strategic partnerships with social media experts, SEO specialists, and influencers,
                        we amplify your charity's voice across all digital platforms.
                      </p>
                      <div className="mt-4 text-end">
                        <Link to="/our-services" className="text-ghibli-green fw-semibold text-decoration-none">
                          Learn More <i className="fas fa-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Challenge Section */}
      <section className="py-5 bg-light position-relative">
        <div className="position-absolute" style={{
          background: 'radial-gradient(circle, rgba(74, 124, 89, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
          backgroundSize: 'contain',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}></div>
        <div className="container position-relative">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold text-ghibli-green mb-3 magical-title">The Challenge We're Solving</h2>
                <div className="position-relative d-inline-block mb-4">
                  <span className="position-absolute" style={{
                    height: '4px',
                    width: '60%',
                    backgroundColor: 'rgba(74, 124, 89, 0.4)',
                    bottom: '-10px',
                    left: '20%'
                  }}></span>
                </div>
                <p className="lead text-muted fs-5 mb-5 enchanted-text">
                  Small charities face significant obstacles in the digital landscape that limit their ability to reach potential donors
                </p>
              </div>

              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="card border-0 shadow-lg rounded-4 h-100 p-4 transform-hover">
                    <div className="text-center">
                      <div className="bg-danger text-white rounded-circle p-3 mx-auto mb-4 shadow" style={{
                        width: '100px',
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem'
                      }}>
                        <h2 className="mb-0 display-6">73%</h2>
                      </div>
                      <h4 className="text-danger mb-3">Hidden Charities</h4>
                      <p className="text-muted">
                        Of small charities struggle with online visibility due to lack of digital marketing expertise
                      </p>
                      <div className="mt-3">
                        <i className="fas fa-low-vision fa-2x text-danger opacity-25"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-lg rounded-4 h-100 p-4 transform-hover">
                    <div className="text-center">
                      <div className="bg-warning text-white rounded-circle p-3 mx-auto mb-4 shadow" style={{
                        width: '100px',
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem'
                      }}>
                        <h2 className="mb-0 display-6">68%</h2>
                      </div>
                      <h4 className="text-warning mb-3">Budget Constraints</h4>
                      <p className="text-muted">
                        Of charities spend less than $500/month on marketing, limiting their reach significantly
                      </p>
                      <div className="mt-3">
                        <i className="fas fa-hand-holding-usd fa-2x text-warning opacity-25"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-lg rounded-4 h-100 p-4 transform-hover">
                    <div className="text-center">
                      <div className="bg-info text-white rounded-circle p-3 mx-auto mb-4 shadow" style={{
                        width: '100px',
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem'
                      }}>
                        <h2 className="mb-0 display-6">91%</h2>
                      </div>
                      <h4 className="text-info mb-3">Digital Discovery</h4>
                      <p className="text-muted">
                        Of donors research charities online before making donations, making digital presence crucial
                      </p>
                      <div className="mt-3">
                        <i className="fas fa-search-dollar fa-2x text-info opacity-25"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Our Solution Section */}
      <section className="py-5 position-relative">
        <div className="position-absolute" style={{
          background: 'linear-gradient(45deg, rgba(74, 124, 89, 0.03) 25%, transparent 25%, transparent 75%, rgba(74, 124, 89, 0.03) 75%, rgba(74, 124, 89, 0.03)), linear-gradient(45deg, rgba(74, 124, 89, 0.03) 25%, transparent 25%, transparent 75%, rgba(74, 124, 89, 0.03) 75%, rgba(74, 124, 89, 0.03))',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}></div>
        <div className="container position-relative">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold text-ghibli-green mb-3 magical-title">Our Comprehensive Solution</h2>
                <div className="position-relative d-inline-block mb-4">
                  <span className="position-absolute" style={{
                    height: '4px',
                    width: '60%',
                    backgroundColor: 'rgba(74, 124, 89, 0.4)',
                    bottom: '-10px',
                    left: '20%'
                  }}></span>
                </div>
                <p className="lead text-muted fs-4 enchanted-text">
                  We've partnered with industry experts to create a powerful ecosystem that amplifies your charity's mission
                </p>
              </div>

              <div className="row g-4">
                <div className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-lg rounded-4 transform-hover">
                    <div className="card-body p-4 text-center">
                      <div className="mb-4 position-relative">
                        <div className="rounded-circle bg-ghibli-green bg-opacity-10 p-4 mx-auto" style={{width: '100px', height: '100px'}}>
                          <i className="fas fa-search text-ghibli-green" style={{fontSize: '2.5rem'}}></i>
                        </div>
                        <div className="position-absolute top-0 start-50 translate-middle-x" style={{
                          width: '30px',
                          height: '30px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '50%',
                          border: '2px solid #4a7c59',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          color: '#4a7c59',
                          fontWeight: 'bold'
                        }}>1</div>
                      </div>
                      <h5 className="card-title text-ghibli-green fw-bold mb-3">SEO Optimization</h5>
                      <p className="card-text text-muted mb-4">
                        Our SEO experts ensure your charity appears in top search results when people look for causes like yours.
                      </p>
                      <div className="mt-3 p-2 bg-success bg-opacity-10 rounded-3">
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

      {/* Enhanced Impact Statistics */}
      <section className="py-5 bg-ghibli-green text-white position-relative">
        <div className="position-absolute" style={{
          background: 'linear-gradient(to bottom, transparent 80%, rgba(255, 255, 255, 0.1) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'bottom',
          backgroundRepeat: 'no-repeat',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}></div>
        <div className="container position-relative" style={{zIndex: 1}}>
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="display-4 fw-bold mb-3 magical-title ">The Power of Digital Presence</h2>
              <div className="position-relative d-inline-block mb-4">
                <span className="position-absolute" style={{
                  height: '4px',
                  width: '60%',
                  backgroundColor: 'rgba(255, 248, 240, 0.4)',
                  bottom: '-10px',
                  left: '20%'
                }}></span>
              </div>
              <p className="lead fs-4 enchanted-text">
                Research shows the incredible impact of strategic digital marketing for charitable organizations
              </p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="bg-white bg-opacity-10 rounded-4 p-4 text-center h-100 transform-hover">
                <div className="mb-4">
                  <div className="rounded-circle bg-white p-3 mx-auto" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-donate text-ghibli-green" style={{fontSize: '2.5rem'}}></i>
                  </div>
                </div>
                <h2 className="fw-bold  display-5 mb-3">5.2x</h2>
                <p className="mb-0 fs-5">Increase in online donations when charities have strong SEO presence</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="bg-white bg-opacity-10 rounded-4 p-4 text-center h-100 transform-hover">
                <div className="mb-4">
                  <div className="rounded-circle bg-white p-3 mx-auto" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-users text-ghibli-green" style={{fontSize: '2.5rem'}}></i>
                  </div>
                </div>
                <h2 className="fw-bold  display-5 mb-3">78%</h2>
                <p className="mb-0 fs-5">Of people discover new charities through social media recommendations</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="bg-white bg-opacity-10 rounded-4 p-4 text-center h-100 transform-hover">
                <div className="mb-4">
                  <div className="rounded-circle bg-white p-3 mx-auto" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-mobile-alt text-ghibli-green" style={{fontSize: '2.5rem'}}></i>
                  </div>
                </div>
                <h2 className="fw-bold  display-5 mb-3">84%</h2>
                <p className="mb-0 fs-5">Of charitable giving research happens on mobile devices</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="bg-white bg-opacity-10 rounded-4 p-4 text-center h-100 transform-hover">
                <div className="mb-4">
                  <div className="rounded-circle bg-white p-3 mx-auto" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-clock text-ghibli-green" style={{fontSize: '2.5rem'}}></i>
                  </div>
                </div>
                <h2 className="fw-bold  display-5 mb-3">48hrs</h2>
                <p className="mb-0 fs-5">Average time for viral social content to reach peak engagement</p>
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
                <Link to="/list-your-charity" className="btn calcifer-button btn-lg px-5 py-3 float-magic">
                  <i className="fas fa-rocket me-2"></i>
                  Start Your Journey Today
                </Link>
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
                <h2 className="display-5 fw-bold mb-4 ">
                  <i className="fas fa-trophy me-3"></i>
                  Coming Soon: Charity Excellence Awards
                </h2>
                <p className="lead fs-5 mb-4">
                  We're launching an exciting initiative to celebrate and promote outstanding small charities through exclusive in-person events!
                </p>
              </div>



              <div className="row mt-5">
                <div className="col-12">
                  <div className="text-center">
                    <h4 className=" mb-4">What Award Winners Receive:</h4>
                    <div className="row g-3">
                      <div className="col-md-3 col-6">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-video  mb-2" style={{fontSize: '2rem'}}></i>
                          <small>Professional Video Features</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-newspaper  mb-2" style={{fontSize: '2rem'}}></i>
                          <small>Press Release Distribution</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-handshake  mb-2" style={{fontSize: '2rem'}}></i>
                          <small>Corporate Partnership Intros</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-bullhorn  mb-2" style={{fontSize: '2rem'}}></i>
                          <small>Social Media Campaigns</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-5">
                <div className="bg-white bg-opacity-10 rounded-3 p-4 d-inline-block">
                  <h5 className=" mb-2">
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

      {/* Enhanced Call to Action */}
      <section className="py-5" style={{
        background: "linear-gradient(135deg, #f8f9fa, #ffffff)",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        borderBottom: "1px solid rgba(0,0,0,0.05)"
      }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h2 className="display-4 fw-bold text-ghibli-green mb-4 magical-title">Ready to Amplify Your Impact?</h2>
              <p className="lead fs-4 text-muted mb-5 enchanted-text">
                Join hundreds of charities that have already transformed their digital presence with Unseen.
                Your mission deserves to be seen by those who care.
              </p>

              <div className="card border-0 shadow-lg rounded-4 p-4 mb-5">
                <div className="card-body">
                  <div className="row g-0 align-items-center">
                    <div className="col-md-8 text-md-start text-center mb-3 mb-md-0">
                      <h4 className="text-ghibli-green mb-1">Start your journey today</h4>
                      <p className="text-muted mb-0">No cost • No obligation • Just impact</p>
                    </div>
                    <div className="col-md-4 text-md-end text-center">
                      <Link to="/list-your-charity" className="btn calcifer-button btn-lg float-magic px-4">
                        <i className="fas fa-rocket me-2"></i> Get Started
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-4 justify-content-center">
                <Link to="/list-your-charity" className="text-decoration-none">
                  <div className="d-flex align-items-center">
                    <div className="bg-ghibli-green text-white rounded-circle p-2 me-2">
                      <i className="fas fa-plus"></i>
                    </div>
                    <span className="text-ghibli-green fw-semibold">List Your Charity</span>
                  </div>
                </Link>

                <Link to="/categories" className="text-decoration-none">
                  <div className="d-flex align-items-center">
                    <div className="bg-ghibli-green text-white rounded-circle p-2 me-2">
                      <i className="fas fa-search"></i>
                    </div>
                    <span className="text-ghibli-green fw-semibold">Explore Charities</span>
                  </div>
                </Link>

                <Link to="/contact" className="text-decoration-none">
                  <div className="d-flex align-items-center">
                    <div className="bg-ghibli-green text-white rounded-circle p-2 me-2">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <span className="text-ghibli-green fw-semibold">Contact Us</span>
                  </div>
                </Link>

                <Link to="/faq" className="text-decoration-none">
                  <div className="d-flex align-items-center">
                    <div className="bg-ghibli-green text-white rounded-circle p-2 me-2">
                      <i className="fas fa-question"></i>
                    </div>
                    <span className="text-ghibli-green fw-semibold">FAQ</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
