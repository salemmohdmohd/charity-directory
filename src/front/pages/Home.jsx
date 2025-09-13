import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import { HeroSection } from "../components/HeroSection.jsx";
import OrganizationCard from "../components/OrganizationCard.jsx";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { organizationService } from "../Services/axios.js";

export const Home = () => {
	const { store, dispatch } = useGlobalReducer()
	const navigate = useNavigate();
	const [featuredOrganizations, setFeaturedOrganizations] = useState([]);
	const [loading, setLoading] = useState(true);

	// Fetch featured organizations on component mount
	useEffect(() => {
		const fetchFeaturedOrganizations = async () => {
			try {
				setLoading(true);
				// Get first 4 verified organizations for featured section
				const response = await organizationService.getOrganizations({
					page: 1,
					per_page: 4,
					status: 'approved',
					verification_level: 'verified'
				});

				// Fetch photos for each organization
				const orgsWithPhotos = await Promise.all(
					(response.organizations || []).map(async (org) => {
						try {
							const photos = await organizationService.getOrganizationPhotos(org.id);
							return {
								...org,
								photos: photos || []
							};
						} catch (error) {
							console.error(`Failed to fetch photos for org ${org.id}:`, error);
							return {
								...org,
								photos: []
							};
						}
					})
				);

				setFeaturedOrganizations(orgsWithPhotos);
			} catch (error) {
				console.error('Error fetching featured organizations:', error);
				dispatch({
					type: 'SET_ERROR',
					payload: 'Failed to load featured organizations.'
				});
			} finally {
				setLoading(false);
			}
		};

		fetchFeaturedOrganizations();
	}, [dispatch]);

	// Handle organization card click
	const handleOrganizationClick = (organization) => {
		const slug = `${organization.id}-${organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
		navigate(`/organizations/${slug}`);
	};

	return (
		<div>
			<HeroSection />

			{/* Featured Charities Section */}
			<section className="py-5 sky-section">
				<div className="container-fluid px-4">
					<div className="text-center mb-5">
						<h2 className="display-5 fw-bold mb-3">Featured Organizations</h2>
						<p className="lead text-muted">Discover and support verified charitable organizations making a real difference</p>
					</div>

					{/* Organization Cards */}
					{loading ? (
						<div className="text-center py-5">
							<div className="spinner-border text-primary" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
							<p className="mt-3">Loading featured organizations...</p>
						</div>
					) : (
						<div className="row g-4 pb-5 mb-5">
							{featuredOrganizations.map((organization) => (
								<div key={organization.id} className="col-sm-6 col-lg-3">
									<OrganizationCard
										organization={organization}
										categoryColorCode="#28a745"
										onCardClick={handleOrganizationClick}
									/>
								</div>
							))}
						</div>
					)}

					{/* View All Organizations Button */}
					<div className="text-center">
						<button
							className="btn calcifer-button btn-lg px-5"
							onClick={() => navigate('/categories')}
						>
							<i className="fas fa-search me-2"></i>
							Explore All Organizations
						</button>
					</div>
				</div>
			</section>

			{/* Statistics Section */}
			<section className="py-5 meadow-section">
				<div className="container">
					<div className="text-center mb-5">
						<h2 className="display-5 fw-bold mb-3">Our Impact Together</h2>
						<p className="lead">Every connection creates ripples of positive change</p>
					</div>
					<div className="row text-center">
						<div className="col-md-3 mb-4">
							<div className="totoro-card p-4 h-100">
								<div className="h1 fw-bold text-primary mb-2"></div>
								<div className="h2 fw-bold text-primary">1,247</div>
								<p className="text-muted mb-0">Verified Charities</p>
								<small className="text-success">Growing daily</small>
							</div>
						</div>
						<div className="col-md-3 mb-4">
							<div className="totoro-card p-4 h-100">
								<div className="h1 fw-bold text-primary mb-2"></div>
								<div className="h2 fw-bold text-primary">50+</div>
								<p className="text-muted mb-0">Impact Categories</p>
								<small className="text-success">Diverse causes</small>
							</div>
						</div>
						<div className="col-md-3 mb-4">
							<div className="totoro-card p-4 h-100">
								<div className="h1 fw-bold text-primary mb-2"></div>
								<div className="h2 fw-bold text-primary">25</div>
								<p className="text-muted mb-0">Countries Served</p>
								<small className="text-success">Global reach</small>
							</div>
						</div>
						<div className="col-md-3 mb-4">
							<div className="totoro-card p-4 h-100">
								<div className="h1 fw-bold text-primary mb-2"></div>
								<div className="h2 fw-bold text-primary">100%</div>
								<p className="text-muted mb-0">Verified Trust</p>
								<small className="text-success">Thoroughly vetted</small>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Call to Action Section */}
			<section className="py-5 bg-totoro text-white">
				<div className="container text-center">
					<div className="row justify-content-center">
						<div className="col-lg-8">
							<h2 className="display-4 fw-bold mb-4">Ready to Make Magic Happen?</h2>
							<p className="lead mb-4 fs-5">
								Join thousands of compassionate souls who are creating positive change.
								Whether you're seeking a cause to support or representing an organization,
								your journey toward meaningful impact starts here.
							</p>
							<div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
								<a href="/signup" className="btn calcifer-button btn-lg px-5 py-3 float-magic">
									<i className="fas fa-heart me-2"></i>
									Start Supporting Causes
								</a>
								<a href="/list-your-charity" className="btn btn-outline-light btn-lg px-5 py-3 float-magic">
									<i className="fas fa-hands-helping me-2"></i>
									List Your Organization
								</a>
							</div>
							<p className="mt-4 mb-0 opacity-75">
								<small>
									<i className="fas fa-shield-alt me-1"></i>
									All organizations are verified • Free to join • Secure platform
								</small>
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};