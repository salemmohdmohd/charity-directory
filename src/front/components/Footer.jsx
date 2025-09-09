import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => (
	<footer className="bg-totoro text-light  py-5 footer-ghibli d-none d-md-block" >

		<div className="container">
			<div className="row g-4">
				{/* Brand Section */}
				<div className="col-lg-4 col-md-6">
					<div className="d-flex align-items-center mb-3">
						<img
							src="Logo.png"
							alt="Unseen Logo"
							height="40"
							className="me-3"
						/>
						<h5 className="fw-bold mb-0 text-ghibli-cream">Unseen</h5>
					</div>
					<p className="mb-3 text-ghibli-light">
						Connecting hearts with causes that spark wonder and change lives.
						Every act of kindness creates ripples of magic in our world.
					</p>
					<div className="social-links">
						<a href="#" className="text-ghibli-cream me-3 social-link" aria-label="Facebook">
							<i className="fab fa-facebook-f"></i>
						</a>
						<a href="#" className="text-ghibli-cream me-3 social-link" aria-label="Twitter">
							<i className="fab fa-twitter"></i>
						</a>
						<a href="#" className="text-ghibli-cream me-3 social-link" aria-label="Instagram">
							<i className="fab fa-instagram"></i>
						</a>
						<a href="#" className="text-ghibli-cream social-link" aria-label="LinkedIn">
							<i className="fab fa-linkedin-in"></i>
						</a>
					</div>
				</div>

				{/* Quick Links */}
				<div className="col-lg-2 col-md-6">
					<h6 className="fw-bold mb-3 text-ghibli-cream">Explore</h6>
					<ul className="list-unstyled footer-links">
						<li className="mb-2">
							<Link to="/" className="footer-link">Home</Link>
						</li>
						<li className="mb-2">
							<Link to="/categories" className="footer-link">Categories</Link>
						</li>
						<li className="mb-2">
							<Link to="/about-us" className="footer-link">About Us</Link>
						</li>
						<li className="mb-2">
							<Link to="/search-history" className="footer-link">Search History</Link>
						</li>
					</ul>
				</div>

				{/* Charity Services */}
				<div className="col-lg-3 col-md-6">
					<h6 className="fw-bold mb-3 text-ghibli-cream">For Charities</h6>
					<ul className="list-unstyled footer-links">
						<li className="mb-2">
							<Link to="/list-your-charity" className="footer-link">List Your Charity</Link>
						</li>
						<li className="mb-2">
							<Link to="/organization-login" className="footer-link">Organization Login</Link>
						</li>
						<li className="mb-2">
							<Link to="/organization-signup" className="footer-link">Register Organization</Link>
						</li>
						<li className="mb-2">
							<a href="#" className="footer-link">Success Stories</a>
						</li>
					</ul>
				</div>

				{/* Contact & Support */}
				<div className="col-lg-3 col-md-6">
					<h6 className="fw-bold mb-3 text-ghibli-cream">Connect With Us</h6>
					<ul className="list-unstyled footer-links">
						<li className="mb-2">
							<Link to="/login" className="footer-link">Login</Link>
						</li>
						<li className="mb-2">
							<Link to="/signup" className="footer-link">Sign Up</Link>
						</li>
						<li className="mb-2">
							<a href="mailto:support@unseen.com" className="footer-link">
								<i className="fas fa-envelope me-2"></i>
								Support
							</a>
						</li>
						<li className="mb-2">
							<a href="#" className="footer-link">
								<i className="fas fa-question-circle me-2"></i>
								Help Center
							</a>
						</li>
					</ul>
				</div>
			</div>

			{/* Bottom Section */}
			<hr className="my-4 border-ghibli-cream opacity-25" />
			<div className="row align-items-center">
				<div className="col-md-6">
					<p className="mb-0 text-ghibli-light">
						<small>
							© 2025 <span className="text-ghibli-cream fw-semibold">Unseen</span>.
							Spreading kindness, one connection at a time.
						</small>
					</p>
				</div>
				<div className="col-md-6 text-md-end">
					<div className="footer-policies">
						<a href="#" className="footer-policy-link me-3">Privacy Policy</a>
						<a href="#" className="footer-policy-link me-3">Terms of Service</a>
						<a href="#" className="footer-policy-link">Cookie Policy</a>
					</div>
				</div>
			</div>

			{/* Magical Footer Message */}
			<div className="text-center mt-4">
				<p className="mb-0 text-ghibli-cream font-italic magical-message">
					✨ "The magic you're looking for is in the work you're avoiding" ✨
				</p>
				<small className="text-ghibli-light">
					Made with 💚 by <span className="text-ghibli-cream fw-semibold">The Unseen Team</span>
				</small>
			</div>
		</div>
	</footer>
);
