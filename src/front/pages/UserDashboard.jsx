import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const UserDashboard = () => {
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();
	const [dashboardData, setDashboardData] = useState({
		totalDonated: "$0.00",
		donationCount: 0,
		favoriteCharities: 0,
		memberSince: "Recently"
	});

	// Check if user is logged in, redirect if not
	useEffect(() => {
		if (!store.user) {
			navigate('/login');
			return;
		}

		// Load user's dashboard data
		const loadDashboardData = async () => {
			try {
				// This would be an API call to get user's donation history, favorites, etc.
				// For now, we'll use some sample data based on user type
				if (store.user.role === 'visitor') {
					setDashboardData({
						totalDonated: "$0.00",
						donationCount: 0,
						favoriteCharities: 0,
						memberSince: "New Member"
					});
				} else {
					// For returning users, you'd fetch actual data from your backend
					setDashboardData({
						totalDonated: "$1,250.00",
						donationCount: 8,
						favoriteCharities: 3,
						memberSince: "January 2024"
					});
				}
			} catch (error) {
				dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data' });
			}
		};

		loadDashboardData();
	}, [store.user, navigate, dispatch]);

	// Handle logout
	const handleLogout = () => {
		dispatch({ type: 'LOGOUT' });
		navigate('/login');
	};

	// Show loading if no user data
	if (!store.user) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="container-fluid py-4">
			{/* Dashboard Header */}
			<div className="row mb-4">
				<div className="col-12">
					<div className="d-flex justify-content-between align-items-center">
						<div>
							<h1 className="h2 mb-1">Welcome back, {store.user?.name || store.user?.email}</h1>
							<p className="text-muted mb-0">Here's what's happening with your charitable giving</p>
						</div>
						<div>
							<button className="btn btn-primary me-2">Make a Donation</button>
							<button 
								className="btn btn-outline-primary me-2"
								onClick={() => navigate('/profile')}
							>
								<i className="bi bi-person me-2"></i>Profile
							</button>
							<button className="btn btn-outline-secondary me-2">Settings</button>
							<button 
								className="btn btn-outline-danger"
								onClick={handleLogout}
							>
								<i className="bi bi-box-arrow-right me-2"></i>Logout
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Stats Cards Row */}
			<div className="row g-4 mb-4">
				<div className="col-md-3 col-sm-6">
					<div className="card bg-primary text-white h-100">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h6 className="card-title mb-1">Total Donated</h6>
									<h3 className="mb-0">{dashboardData.totalDonated}</h3>
								</div>
								<div className="fs-1 opacity-50">
									<i className="bi bi-heart-fill"></i>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="col-md-3 col-sm-6">
					<div className="card bg-success text-white h-100">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h6 className="card-title mb-1">Donations Made</h6>
									<h3 className="mb-0">{dashboardData.donationCount}</h3>
								</div>
								<div className="fs-1 opacity-50">
									<i className="bi bi-gift-fill"></i>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="col-md-3 col-sm-6">
					<div className="card bg-info text-white h-100">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h6 className="card-title mb-1">Favorite Charities</h6>
									<h3 className="mb-0">{dashboardData.favoriteCharities}</h3>
								</div>
								<div className="fs-1 opacity-50">
									<i className="bi bi-star-fill"></i>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="col-md-3 col-sm-6">
					<div className="card bg-warning text-white h-100">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h6 className="card-title mb-1">Member Since</h6>
									<h5 className="mb-0">{dashboardData.memberSince}</h5>
								</div>
								<div className="fs-1 opacity-50">
									<i className="bi bi-calendar-check-fill"></i>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Row */}
			<div className="row g-4">
				{/* Recent Activity Section */}
				<div className="col-lg-8">
					<div className="card h-100">
						<div className="card-header d-flex justify-content-between align-items-center">
							<h5 className="mb-0">Recent Activity</h5>
							<button className="btn btn-sm btn-outline-primary">View All</button>
						</div>
						<div className="card-body">
							{/* Show different content based on user role */}
							{store.user.role === 'visitor' ? (
								<div className="text-center py-5">
									<i className="bi bi-heart fs-1 text-primary mb-3 d-block"></i>
									<h5 className="mb-2">Welcome to your dashboard!</h5>
									<p className="text-muted mb-3">Start by making your first donation or browsing charities</p>
									<button className="btn btn-primary me-2">Browse Charities</button>
									<button className="btn btn-outline-primary">Make a Donation</button>
								</div>
							) : (
								<div className="text-center py-5 text-muted">
									<i className="bi bi-clock-history fs-1 mb-3 d-block"></i>
									<p className="mb-0">Recent donation activity will appear here</p>
									<small>This section will show your recent donations and updates</small>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Quick Actions Sidebar */}
				<div className="col-lg-4">
					<div className="card h-100">
						<div className="card-header">
							<h5 className="mb-0">Quick Actions</h5>
						</div>
						<div className="card-body">
							<div className="d-grid gap-2">
								<button className="btn btn-primary btn-lg">
									<i className="bi bi-plus-circle me-2"></i>
									New Donation
								</button>
								<button className="btn btn-outline-primary">
									<i className="bi bi-search me-2"></i>
									Browse Charities
								</button>
								<button className="btn btn-outline-secondary">
									<i className="bi bi-heart me-2"></i>
									My Favorites
								</button>
								<button 
									className="btn btn-outline-info"
									onClick={() => navigate('/search-history')}
								>
									<i className="bi bi-clock-history me-2"></i>
									Search History
								</button>
								<button className="btn btn-outline-info">
									<i className="bi bi-file-earmark-text me-2"></i>
									Download Receipt
								</button>
							</div>

							{/* Quick Stats */}
							<hr className="my-4" />
							<h6 className="text-muted mb-3">This Month</h6>
							<div className="row g-2 text-center">
								<div className="col-6">
									<div className="bg-light rounded p-2">
										<div className="fw-bold text-primary">$125</div>
										<small className="text-muted">Donated</small>
									</div>
								</div>
								<div className="col-6">
									<div className="bg-light rounded p-2">
										<div className="fw-bold text-success">2</div>
										<small className="text-muted">Causes</small>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Additional Sections Row */}
			<div className="row g-4 mt-4">
				{/* Recommended Charities */}
				<div className="col-md-6">
					<div className="card">
						<div className="card-header d-flex justify-content-between align-items-center">
							<h5 className="mb-0">Recommended for You</h5>
							<small className="text-muted">Based on your interests</small>
						</div>
						<div className="card-body">
							{/* Placeholder for recommended charities component */}
							<div className="text-center py-4 text-muted">
								<i className="bi bi-lightbulb fs-1 mb-3 d-block"></i>
								<p className="mb-0">Charity recommendations will appear here</p>
							</div>
						</div>
					</div>
				</div>

				{/* Impact Summary */}
				<div className="col-md-6">
					<div className="card">
						<div className="card-header">
							<h5 className="mb-0">Your Impact</h5>
						</div>
						<div className="card-body">
							{/* Placeholder for impact summary component */}
							<div className="text-center py-4 text-muted">
								<i className="bi bi-graph-up fs-1 mb-3 d-block"></i>
								<p className="mb-0">Impact metrics will be displayed here</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserDashboard;
