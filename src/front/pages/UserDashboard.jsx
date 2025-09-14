import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { api } from '../Services/axios';

const UserDashboard = () => {
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();
	// dashboardData stats removed; keep a minimal placeholder object if needed later
	const [dashboardData, setDashboardData] = useState({});

	// Check if user is logged in, redirect if not
	useEffect(() => {
		if (!store.user) {
			navigate('/login');
			return;
		}

		// Load user's dashboard data
		const loadDashboardData = async () => {
			try {
				// Dashboard stats removed; no sample donation data is set
			} catch (error) {
				dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data' });
			}
		};

		loadDashboardData();
	}, [store.user, navigate, dispatch]);

		// Bookmarks
		const [bookmarks, setBookmarks] = useState([]);
		const [loadingBookmarks, setLoadingBookmarks] = useState(true);

		useEffect(() => {
			const fetchBookmarks = async () => {
				if (!store.user) return;
				try {
					setLoadingBookmarks(true);
					const res = await api.get('/users/me/bookmarks');
					// Accept multiple possible response shapes:
					// - Array directly (res.data === [])
					// - { bookmarks: [...] }
					// - { data: { bookmarks: [...] } }
					const payload = res && res.data ? res.data : null;
					let list = [];
					if (Array.isArray(payload)) {
						list = payload;
					} else if (payload) {
						if (Array.isArray(payload.bookmarks)) list = payload.bookmarks;
						else if (payload.data && Array.isArray(payload.data.bookmarks)) list = payload.data.bookmarks;
						else if (Array.isArray(payload.items)) list = payload.items; // fallback key
					}
					setBookmarks(list);
				} catch (err) {
					console.error('Failed to fetch bookmarks:', err);
					setBookmarks([]);
				} finally {
					setLoadingBookmarks(false);
				}
			};

			fetchBookmarks();
		}, [store.user]);

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

					</div>
				</div>
			</div>



			{/* Main Content Row */}
			<div className="row g-4">
				{/* My Bookmarks */}
				<div className="col-12">
					<div className="card">
						<div className="card-header d-flex justify-content-between align-items-center">
							<h5 className="mb-0">My Bookmarks</h5>
							<button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/bookmarks')}>View All</button>
						</div>
						<div className="card-body">
							{loadingBookmarks ? (
								<div className="text-center py-4">
									<div className="spinner-border text-primary" role="status">
										<span className="visually-hidden">Loading...</span>
									</div>
								</div>
							) : bookmarks && bookmarks.length > 0 ? (
								<ul className="list-group">
									{bookmarks.map((bookmark, index) => {
										const id = bookmark.id || bookmark.organization_id;
										const name = bookmark.name || bookmark.organization_name || `organization-${id}`;
										const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
										return (
											<li key={index} className="list-group-item d-flex justify-content-between align-items-center">
												<div>
													<i className="fas fa-bookmark text-primary me-2"></i>
													<Link to={`/organizations/${id}-${slug}`}>{name}</Link>
												</div>
												<span className="text-muted small">{(bookmark.bookmarked_at || bookmark.created_at) ? new Date(bookmark.bookmarked_at || bookmark.created_at).toLocaleDateString() : ''}</span>
											</li>
										);
									})}
								</ul>
							) : (
								<div className="text-center py-4">
									<p className="text-muted mb-2">You haven't bookmarked any organizations yet.</p>
									<button className="btn btn-primary" onClick={() => navigate('/categories')}>Browse Organizations</button>
								</div>
							)}
						</div>
						</div>
					</div>

			</div>


		</div>
	);
};

export default UserDashboard;
