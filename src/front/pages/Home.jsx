import React from "react"
import { HeroSection } from "../components/HeroSection.jsx";

export const Home = () => {
	return (
		<div>
			<HeroSection />

			{/* Featured Charities Section */}
			<section className="py-5 bg-light">

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