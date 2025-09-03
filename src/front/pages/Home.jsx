import React, { useEffect } from "react"
import { HeroSection } from "../components/HeroSection.jsx";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	useEffect(() => {
		loadMessage()
	}, [])

	// Sample charity data - you can replace this with data from your store or API
	const charities = [
		{
			id: 1,
			name: "Ocean Conservation Fund",
			description: "Protecting marine ecosystems and wildlife through research, education, and conservation efforts worldwide.",
			image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=300&h=200&fit=crop",
			raised: "$45,230",
			goal: "$60,000",
			progress: 75
		},
		{
			id: 2,
			name: "Children's Education Initiative",
			description: "Providing quality education and learning resources to underprivileged children in rural communities.",
			image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=300&h=200&fit=crop",
			raised: "$32,150",
			goal: "$50,000",
			progress: 64
		},
		{
			id: 3,
			name: "Community Food Bank",
			description: "Fighting hunger by providing nutritious meals and food assistance to families in need.",
			image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&h=200&fit=crop",
			raised: "$28,900",
			goal: "$40,000",
			progress: 72
		},
		{
			id: 4,
			name: "Mental Health Support Network",
			description: "Offering counseling services and mental health resources to support community wellbeing.",
			image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
			raised: "$18,750",
			goal: "$35,000",
			progress: 54
		}
	];

	return (
		<div>
			<HeroSection />

			{/* Featured Charities Section */}
			<section className="py-5 sky-section">
				<div className="container-fluid px-4">
					<div className="text-center mb-5">
						<h2 className="display-5 fw-bold mb-3">Featured Charities</h2>
						<p className="lead text-muted">Discover and support verified charitable organizations making a real difference</p>
					</div>

					{/* Charity Cards */}
					<div className="row g-4 pb-5 mb-5">
						{charities.map((charity) => (
							<div key={charity.id} className="col-sm-6 col-lg-3">
								<div className="totoro-card h-100 shadow-sm" style={{ minHeight: "500px" }}>
									<img
										src={charity.image}
										className="card-img-top"
										alt={charity.name}
										style={{ height: "250px", objectFit: "cover" }}
									/>
									<div className="card-body d-flex flex-column p-4">
										<h5 className="card-title">{charity.name}</h5>
										<p className="card-text flex-grow-1">{charity.description}</p>

										{/* Progress Section */}
										<div className="mb-3">
											<div className="d-flex justify-content-between mb-1">
												<small className="text-muted">Raised: {charity.raised}</small>
												<small className="text-muted">Goal: {charity.goal}</small>
											</div>
											<div className="progress" style={{ height: "8px" }}>
												<div
													className="progress-bar bg-success"
													role="progressbar"
													style={{ width: `${charity.progress}%` }}
													aria-valuenow={charity.progress}
													aria-valuemin="0"
													aria-valuemax="100"
												></div>
											</div>
											<small className="text-muted">{charity.progress}% funded</small>
										</div>

										{/* Action Buttons */}
										<div className="d-grid gap-2">
											<button className="btn calcifer-button">Donate Now</button>
											<button className="btn btn-outline-secondary btn-sm">Learn More</button>
										</div>
									</div>
								</div>
							</div>
						))}
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
								<div className="h1 fw-bold text-primary mb-2">🌱</div>
								<div className="h2 fw-bold text-primary">1,247</div>
								<p className="text-muted mb-0">Verified Charities</p>
								<small className="text-success">Growing daily</small>
							</div>
						</div>
						<div className="col-md-3 mb-4">
							<div className="totoro-card p-4 h-100">
								<div className="h1 fw-bold text-primary mb-2">🎋</div>
								<div className="h2 fw-bold text-primary">50+</div>
								<p className="text-muted mb-0">Impact Categories</p>
								<small className="text-success">Diverse causes</small>
							</div>
						</div>
						<div className="col-md-3 mb-4">
							<div className="totoro-card p-4 h-100">
								<div className="h1 fw-bold text-primary mb-2">🌍</div>
								<div className="h2 fw-bold text-primary">25</div>
								<p className="text-muted mb-0">Countries Served</p>
								<small className="text-success">Global reach</small>
							</div>
						</div>
						<div className="col-md-3 mb-4">
							<div className="totoro-card p-4 h-100">
								<div className="h1 fw-bold text-primary mb-2">✨</div>
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