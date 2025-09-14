import React from 'react';
import { Link, useLocation } from "react-router-dom";
import useAuth from '../hooks/useAuth';
import NotificationIndicator from './NotificationIndicator';
import SearchBar from './SearchBar';
import LocationSelector from './LocationSelector';

export const Navbar = () => {
	const location = useLocation();
	const { user, isAuthenticated, logout } = useAuth();

	const isActive = (path) => location.pathname === path;

	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-totoro shadow-sm nav-ghibli">
			<div className="container">
				{/* Brand */}
				<Link to="/" className="navbar-brand fw-bold fs-3 d-flex align-items-center">
					<img src="/Logo.png" alt="Unseen Logo" height="32" className="me-2" style={{ objectFit: 'contain' }} />
				</Link>

				{/* Mobile: List Your Charity - moved for better layout */}
				<div className="d-flex align-items-center d-lg-none ms-auto">
					<Link to="/list-your-charity" className="btn calcifer-button float-magic btn-sm me-3 " role="button">
						<i className="fas fa-plus" aria-hidden="true"></i>
					</Link>
				</div>

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
					{/* Left-aligned nav items */}
					<ul className="navbar-nav me-auto">
						<li className="nav-item">
							<Link to="/categories" className={`nav-link ${isActive('/categories') ? 'active' : ''}`}>
								<span>Categories</span>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/about-us" className={`nav-link ${isActive('/about-us') ? 'active' : ''}`}>
								<span>About</span>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/advertise" className={`nav-link ${isActive('/advertise') ? 'active' : ''}`}>
								<span>Advertise</span>
							</Link>
						</li>
					</ul>

					{/* Search Bar in the middle */}
					<div className="d-flex align-items-center mx-auto" style={{ minWidth: '500px', maxWidth: '800px' }}>
						<SearchBar />
					</div>

					{/* Right-aligned nav items */}
					<ul className="navbar-nav ms-auto align-items-center">
						{/* Location Selector - Always visible */}
						<li className="nav-item">
							<LocationSelector />
						</li>

						{isAuthenticated ? (
							// User is logged in
							<>
								<li className="nav-item d-flex align-items-center me-3">
									<NotificationIndicator />
								</li>
								<li className="nav-item dropdown">
									<a
										className="nav-link dropdown-toggle d-flex align-items-center"
										href="#"
										id="navbarDropdown"
										role="button"
										data-bs-toggle="dropdown"
										aria-expanded="false"
									>
										<i className="fas fa-user-circle me-2 fs-5" aria-hidden="true"></i>
										<span className="d-none d-md-inline">{user?.name || user?.email || 'User'}</span>
									</a>
									<ul className="dropdown-menu dropdown-menu-end bg-cream border-forest" aria-labelledby="navbarDropdown">
										<li>
											{user?.role === 'org_admin' ? (
												<Link className="dropdown-item text-forest" to="/organization-dashboard">
													<i className="fas fa-building me-2 text-totoro"></i>
													<span>Organization Dashboard</span>
												</Link>
											) : (
												<Link className="dropdown-item text-forest" to="/dashboard">
													<i className="fas fa-tachometer-alt me-2 text-totoro"></i>
													<span>Dashboard</span>
												</Link>
											)}
										</li>
										<li>
											<Link className="dropdown-item text-forest" to="/profile">
												<i className="fas fa-user-edit me-2 text-totoro"></i>
												<span>Profile</span>
											</Link>
										</li>
										<li>
											<Link className="dropdown-item text-forest" to="/notifications">
												<i className="fas fa-bell me-2 text-totoro"></i>
												<span>Notifications</span>
											</Link>
										</li>
										<li>
											<Link className="dropdown-item text-forest" to="/notification-settings">
												<i className="fas fa-cog me-2 text-totoro"></i>
												<span>Notification Settings</span>
											</Link>
										</li>
										<li><hr className="dropdown-divider border-meadow" /></li>
										<li>
											<button
												className="dropdown-item text-forest"
												onClick={logout}
												style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
											>
												<i className="fas fa-sign-out-alt me-2 text-calcifer"></i>
												<span>Logout</span>
											</button>
										</li>
									</ul>
								</li>
								<li className="nav-item d-none d-lg-block ms-3">
									<Link to="/list-your-charity" className="btn calcifer-button float-magic" role="button">
										<i className="fas fa-plus " aria-hidden="true"></i>
									</Link>
								</li>
							</>
						) : (
							// User is not logged in
							<>
								<li className="nav-item">
									<Link to="/login" className="nav-link">
										Login
									</Link>
								</li>
                                <li className="nav-item d-none d-lg-block ms-3">
									<Link to="/list-your-charity" className="btn calcifer-button float-magic" role="button">
										<i className="fas fa-plus me-2" aria-hidden="true"></i>
										<span>List Your Charity</span>
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
