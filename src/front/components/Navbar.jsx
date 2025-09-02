import React from 'react';
import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
	const location = useLocation();

	// Check if current path matches the link
	const isActive = (path) => {
		return location.pathname === path;
	};

	return (
		<nav
			className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm"
			style={{ backgroundColor: 'var(--charity-primary)' }}
		>
			<div className="container">
				{/* Brand */}
				<Link
					to="/"
					className="navbar-brand fw-bold fs-3"
				>
					<i className="fas fa-heart me-2 text-danger" aria-hidden="true"></i>
					Unseen
				</Link>

				{/* Mobile toggle button */}
				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarNav"
					aria-controls="navbarNav"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				{/* Navigation links */}
				<div className="collapse navbar-collapse" id="navbarNav">
					<ul className="navbar-nav ms-auto">
						<li className="nav-item">
							<Link
								to="/"
								className={`nav-link ${isActive('/') ? 'active' : ''}`}
								aria-current={isActive('/') ? 'page' : undefined}
							>
								<i className="fas fa-home me-1" aria-hidden="true"></i>
								Home
							</Link>
						</li>
						<li className="nav-item">
							<Link
								to="/categories"
								className={`nav-link ${isActive('/categories') ? 'active' : ''}`}
								aria-current={isActive('/categories') ? 'page' : undefined}
							>
								<i className="fas fa-th-large me-1" aria-hidden="true"></i>
								Categories
							</Link>
						</li>
						<li className="nav-item">
							<Link
								to="/about-us"
								className={`nav-link ${isActive('/about-us') ? 'active' : ''}`}
								aria-current={isActive('/about-us') ? 'page' : undefined}
							>
								<i className="fas fa-info-circle me-1" aria-hidden="true"></i>
								About Us
							</Link>
						</li>
						<li className="nav-item">
							<Link
								to="/login"
								className={`nav-link ${isActive('/login') ? 'active' : ''}`}
								aria-current={isActive('/login') ? 'page' : undefined}
							>
								<i className="fas fa-sign-in-alt me-1" aria-hidden="true"></i>
								Login
							</Link>
						</li>
						<li className="nav-item">
							<Link
								to="/signup"
								className={`nav-link ${isActive('/signup') ? 'active' : ''}`}
								aria-current={isActive('/signup') ? 'page' : undefined}
							>
								<i className="fas fa-user-plus me-1" aria-hidden="true"></i>
								Sign Up
							</Link>
						</li>
						<li className="nav-item">
							<Link
								to="/list-your-charity"
								className="btn btn-success ms-2"
								role="button"
							>
								<i className="fas fa-plus me-1" aria-hidden="true"></i>
								List Your Charity
							</Link>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
};