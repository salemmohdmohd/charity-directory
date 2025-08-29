import React, { useState} from 'react';
import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-expand-md navbar-light bg-light">
			<div className="container">
				<Link to="/" className="navbar-brand">
					Unseen
				</Link>
				<button 
					className="navbar-toggler" 
					type="button" 
					data-bs-toggle="collapse" 
					data-bs-target="#navbarNav"
				>
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarNav">
					<div className="navbar-nav ms-auto">
						<Link to="/categories" className="nav-link">
							Categories
						</Link>
						<Link to="/login-signup" className="nav-link">
							Login/Signup
						</Link>
						<Link to="/about-us" className="nav-link">
							About Us
						</Link>
						<Link to="/list-your-charity" className="nav-link">
							List Your Charity +
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
};