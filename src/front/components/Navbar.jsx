import React, { useState} from 'react';
import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav 
			className="navbar navbar-expand-md navbar-light" 
			style={{ backgroundColor: '#005555', borderBottom: '2px solid #218838' }}
		>
			<div className="container">
				<Link 
					to="/" 
					className="navbar-brand"
					style={{ color: '#fff', fontWeight: '600' }}
				>
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
						<Link 
							to="/categories" 
							className="nav-link"
							style={{ color: '#fff', transition: 'all 0.3s ease' }}
							onMouseEnter={(e) => {
								e.target.style.color = '#343a40';
								e.target.style.backgroundColor = '#fff';
								e.target.style.borderRadius = '5px';
							}}
							onMouseLeave={(e) => {
								e.target.style.color = '#fff';
								e.target.style.backgroundColor = 'transparent';
							}}
						>
							Categories
						</Link>
						<Link 
							to="/login" 
							className="nav-link"
							style={{ color: '#fff', transition: 'all 0.3s ease' }}
							onMouseEnter={(e) => {
								e.target.style.color = '#343a40';
								e.target.style.backgroundColor = '#fff';
								e.target.style.borderRadius = '5px';
							}}
							onMouseLeave={(e) => {
								e.target.style.color = '#fff';
								e.target.style.backgroundColor = 'transparent';
							}}
						>
							Login/Signup
						</Link>
						<Link 
							to="/about-us" 
							className="nav-link"
							style={{ color: '#fff', transition: 'all 0.3s ease' }}
							onMouseEnter={(e) => {
								e.target.style.color = '#343a40';
								e.target.style.backgroundColor = '#fff';
								e.target.style.borderRadius = '5px';
							}}
							onMouseLeave={(e) => {
								e.target.style.color = '#fff';
								e.target.style.backgroundColor = 'transparent';
							}}
						>
							About Us
						</Link>
						<Link 
							to="/list-your-charity" 
							className="nav-link"
							style={{ 
								color: '#28a745', 
								fontWeight: '600', 
								border: '2px solid #fff',
								borderRadius: '5px',
								padding: '8px 12px',
								backgroundColor: '#fff',
								transition: 'all 0.3s ease'
							}}
							onMouseEnter={(e) => {
								e.target.style.backgroundColor = '#343a40';
								e.target.style.color = '#fff';
								e.target.style.borderColor = '#343a40';
							}}
							onMouseLeave={(e) => {
								e.target.style.backgroundColor = '#fff';
								e.target.style.color = '#28a745';
								e.target.style.borderColor = '#fff';
							}}
						>
							List Your Charity +
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
};