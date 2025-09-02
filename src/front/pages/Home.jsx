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

			if (response.ok) dispatch({ type: "SET_NOTIFICATION", payload: data.message })

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
			<section className="py-5 bg-light">
				<div className="container">
					<div className="text-center mb-5">
						<h2 className="display-5 fw-bold mb-3">Featured Charities</h2>
						<p className="lead text-muted">Discover and support verified charitable organizations making a real difference</p>
					</div>
					
					{/* Charity Cards */}
					<div className="row g-4">
						{charities.map((charity) => (
							<div key={charity.id} className="col-sm-6 col-lg-3">
								<div className="card h-100 shadow-sm" style={{ minHeight: "500px" }}>
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
											<button className="btn btn-primary">Donate Now</button>
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
			<section className="py-5">
				<div className="container">
					<div className="row text-center">
						<div className="col-md-3 mb-4">
							<div className="h2 fw-bold text-primary">1000+</div>
							<p className="text-muted">Verified Charities</p>
						</div>
						<div className="col-md-3 mb-4">
							<div className="h2 fw-bold text-primary">50+</div>
							<p className="text-muted">Categories</p>
						</div>
						<div className="col-md-3 mb-4">
							<div className="h2 fw-bold text-primary">25</div>
							<p className="text-muted">Countries</p>
						</div>
						<div className="col-md-3 mb-4">
							<div className="h2 fw-bold text-primary">100%</div>
							<p className="text-muted">Verified Organizations</p>
						</div>
					</div>
				</div>
			</section>

			{/* Call to Action Section */}
			<section className="py-5 bg-primary text-white">
				<div className="container text-center">
					<div className="row">
					</div>
				</div>
			</section>
		</div>
	);
};