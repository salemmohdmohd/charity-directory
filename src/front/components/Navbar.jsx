import React from 'react';
import { Link, useLocation } from "react-router-dom";
import useAuth from '../hooks/useAuth';

export const Navbar = () => {
	const location = useLocation();
	const { user, isAuthenticated, logout } = useAuth();

	// Check if current path matches the link
	const isActive = (path) => {
		return location.pathname === path;
	};

	return (
		<nav
			className="navbar navbar-expand-lg navbar-dark bg-totoro shadow-sm nav-ghibli"
		>
			<div className="container">
				{/* Brand */}
				<Link
					to="/"
					className="navbar-brand fw-bold fs-3 d-flex align-items-center"
				>
					<img
						src="/Logo.png"
						alt="Unseen Logo"
						height="32"
						className="me-2"
					/>
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

						{/* Authentication Section */}
						{isAuthenticated ? (
							// User is logged in
							<>
								<li className="nav-item dropdown">
									<a
										className="nav-link dropdown-toggle"
										href="#"
										id="navbarDropdown"
										role="button"
										data-bs-toggle="dropdown"
										aria-expanded="false"
									>
										<i className="fas fa-user me-1" aria-hidden="true"></i>
										{user?.name || user?.email || 'User'}
									</a>
									<ul className="dropdown-menu" aria-labelledby="navbarDropdown">
										<li>
											{user?.role === 'org_admin' ? (
												<Link className="dropdown-item" to="/org-dashboard">
													<i className="fas fa-building me-2"></i>
													Organization Dashboard
												</Link>
											) : (
												<Link className="dropdown-item" to="/dashboard">
													<i className="fas fa-tachometer-alt me-2"></i>
													Dashboard
												</Link>
											)}
										</li>
										<li>
											<Link className="dropdown-item" to="/profile">
												<i className="fas fa-user-edit me-2"></i>
												Profile
											</Link>
										</li>
										<li>
											<Link className="dropdown-item" to="/search-history">
												<i className="fas fa-history me-2"></i>
												Search History
											</Link>
										</li>
										<li><hr className="dropdown-divider" /></li>
										<li>
											<button
												className="dropdown-item"
												onClick={logout}
												style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
											>
												<i className="fas fa-sign-out-alt me-2"></i>
												Logout
											</button>
										</li>
									</ul>
								</li>
								<li className="nav-item">
									<Link
										to="/list-your-charity"
										className="btn calcifer-button ms-2 float-magic"
										role="button"
									>
										<i className="fas fa-plus me-1" aria-hidden="true"></i>
										List Your Charity
									</Link>
								</li>
							</>
						) : (
							// User is not logged in
							<>
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
										className="btn calcifer-button ms-2 float-magic"
										role="button"
									>
										<i className="fas fa-plus me-1" aria-hidden="true"></i>
										List Your Charity
									</Link>
								</li>
							</>
						)}
					</ul>
				</div>
			</div>
		</nav>
	);
};