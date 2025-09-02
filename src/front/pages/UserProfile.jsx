import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const UserProfile = () => {
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const [profileData, setProfileData] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
		donationPreferences: {
			frequency: "monthly",
			amount: "",
			categories: []
		}
	});

	// Check if user is logged in, redirect if not
	useEffect(() => {
		if (!store.user) {
			navigate('/login');
			return;
		}

		// Load user profile data from store
		setProfileData({
			name: store.user.name || "",
			email: store.user.email || "",
			phone: store.user.phone || "",
			address: store.user.address || "",
			city: store.user.city || "",
			state: store.user.state || "",
			zipCode: store.user.zipCode || "",
			donationPreferences: store.user.donationPreferences || {
				frequency: "monthly",
				amount: "",
				categories: []
			}
		});
	}, [store.user, navigate]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setProfileData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handlePreferenceChange = (field, value) => {
		setProfileData(prev => ({
			...prev,
			donationPreferences: {
				...prev.donationPreferences,
				[field]: value
			}
		}));
	};

	const handleSave = async () => {
		try {
			// Update the global state with new profile data
			dispatch({
				type: 'UPDATE_USER',
				payload: {
					...store.user,
					...profileData
				}
			});
			setIsEditing(false);
			// In a real app, you'd make an API call here
		} catch (error) {
			dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
		}
	};

	const handleCancel = () => {
		// Reset form to original data
		setProfileData({
			name: store.user.name || "",
			email: store.user.email || "",
			phone: store.user.phone || "",
			address: store.user.address || "",
			city: store.user.city || "",
			state: store.user.state || "",
			zipCode: store.user.zipCode || "",
			donationPreferences: store.user.donationPreferences || {
				frequency: "monthly",
				amount: "",
				categories: []
			}
		});
		setIsEditing(false);
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
			{/* Profile Header */}
			<div className="row mb-4">
				<div className="col-12">
					<div className="d-flex justify-content-between align-items-center">
						<div>
							<h1 className="h2 mb-1">User Profile</h1>
							<p className="text-muted mb-0">Manage your account information and preferences</p>
						</div>
						<div>
							<button 
								className="btn btn-outline-secondary me-2"
								onClick={() => navigate('/dashboard')}
							>
								<i className="bi bi-arrow-left me-2"></i>
								Back to Dashboard
							</button>
							{!isEditing ? (
								<button 
									className="btn btn-primary"
									onClick={() => setIsEditing(true)}
								>
									<i className="bi bi-pencil me-2"></i>
									Edit Profile
								</button>
							) : (
								<div>
									<button 
										className="btn btn-success me-2"
										onClick={handleSave}
									>
										<i className="bi bi-check me-2"></i>
										Save Changes
									</button>
									<button 
										className="btn btn-secondary"
										onClick={handleCancel}
									>
										Cancel
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="row">
				{/* Profile Information */}
				<div className="col-lg-8">
					<div className="card mb-4">
						<div className="card-header">
							<h5 className="mb-0">Personal Information</h5>
						</div>
						<div className="card-body">
							<div className="row">
								<div className="col-md-6 mb-3">
									<label className="form-label">Full Name</label>
									{isEditing ? (
										<input
											type="text"
											className="form-control"
											name="name"
											value={profileData.name}
											onChange={handleInputChange}
										/>
									) : (
										<p className="form-control-plaintext">{profileData.name || 'Not provided'}</p>
									)}
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Email Address</label>
									{isEditing ? (
										<input
											type="email"
											className="form-control"
											name="email"
											value={profileData.email}
											onChange={handleInputChange}
										/>
									) : (
										<p className="form-control-plaintext">{profileData.email || 'Not provided'}</p>
									)}
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Phone Number</label>
									{isEditing ? (
										<input
											type="tel"
											className="form-control"
											name="phone"
											value={profileData.phone}
											onChange={handleInputChange}
										/>
									) : (
										<p className="form-control-plaintext">{profileData.phone || 'Not provided'}</p>
									)}
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Address</label>
									{isEditing ? (
										<input
											type="text"
											className="form-control"
											name="address"
											value={profileData.address}
											onChange={handleInputChange}
										/>
									) : (
										<p className="form-control-plaintext">{profileData.address || 'Not provided'}</p>
									)}
								</div>
								<div className="col-md-4 mb-3">
									<label className="form-label">City</label>
									{isEditing ? (
										<input
											type="text"
											className="form-control"
											name="city"
											value={profileData.city}
											onChange={handleInputChange}
										/>
									) : (
										<p className="form-control-plaintext">{profileData.city || 'Not provided'}</p>
									)}
								</div>
								<div className="col-md-4 mb-3">
									<label className="form-label">State</label>
									{isEditing ? (
										<input
											type="text"
											className="form-control"
											name="state"
											value={profileData.state}
											onChange={handleInputChange}
										/>
									) : (
										<p className="form-control-plaintext">{profileData.state || 'Not provided'}</p>
									)}
								</div>
								<div className="col-md-4 mb-3">
									<label className="form-label">Zip Code</label>
									{isEditing ? (
										<input
											type="text"
											className="form-control"
											name="zipCode"
											value={profileData.zipCode}
											onChange={handleInputChange}
										/>
									) : (
										<p className="form-control-plaintext">{profileData.zipCode || 'Not provided'}</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Donation Preferences */}
					<div className="card">
						<div className="card-header">
							<h5 className="mb-0">Donation Preferences</h5>
						</div>
						<div className="card-body">
							<div className="row">
								<div className="col-md-6 mb-3">
									<label className="form-label">Preferred Donation Frequency</label>
									{isEditing ? (
										<select 
											className="form-select"
											value={profileData.donationPreferences.frequency}
											onChange={(e) => handlePreferenceChange('frequency', e.target.value)}
										>
											<option value="monthly">Monthly</option>
											<option value="quarterly">Quarterly</option>
											<option value="annually">Annually</option>
											<option value="one-time">One-time</option>
										</select>
									) : (
										<p className="form-control-plaintext">
											{profileData.donationPreferences.frequency || 'Not set'}
										</p>
									)}
								</div>
								<div className="col-md-6 mb-3">
									<label className="form-label">Preferred Amount</label>
									{isEditing ? (
										<input
											type="text"
											className="form-control"
											value={profileData.donationPreferences.amount}
											onChange={(e) => handlePreferenceChange('amount', e.target.value)}
											placeholder="e.g., $50"
										/>
									) : (
										<p className="form-control-plaintext">
											{profileData.donationPreferences.amount || 'Not set'}
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Profile Summary Sidebar */}
				<div className="col-lg-4">
					<div className="card">
						<div className="card-header">
							<h5 className="mb-0">Profile Summary</h5>
						</div>
						<div className="card-body text-center">
							<div className="mb-3">
								<div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
									 style={{ width: '80px', height: '80px' }}>
									<i className="bi bi-person-fill text-white fs-1"></i>
								</div>
								<h5 className="mb-1">{profileData.name || store.user.name || 'User'}</h5>
								<p className="text-muted mb-0">{store.user.role}</p>
							</div>
							
							<hr />
							
							<div className="row g-2 text-center">
								<div className="col-6">
									<div className="bg-light rounded p-2">
										<div className="fw-bold text-primary">8</div>
										<small className="text-muted">Donations</small>
									</div>
								</div>
								<div className="col-6">
									<div className="bg-light rounded p-2">
										<div className="fw-bold text-success">3</div>
										<small className="text-muted">Favorites</small>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Account Settings */}
					<div className="card mt-4">
						<div className="card-header">
							<h5 className="mb-0">Account Settings</h5>
						</div>
						<div className="card-body">
							<div className="d-grid gap-2">
								<button className="btn btn-outline-primary btn-sm">
									<i className="bi bi-key me-2"></i>
									Change Password
								</button>
								<button className="btn btn-outline-info btn-sm">
									<i className="bi bi-bell me-2"></i>
									Notification Settings
								</button>
								<button className="btn btn-outline-secondary btn-sm">
									<i className="bi bi-shield-check me-2"></i>
									Privacy Settings
								</button>
								<hr />
								<button className="btn btn-outline-danger btn-sm">
									<i className="bi bi-trash me-2"></i>
									Delete Account
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserProfile;
