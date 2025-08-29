import React, { useState} from 'react';
import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav 
			className="navbar navbar-expand-md navbar-light" 
			style={{ backgroundColor: '#fff', borderBottom: '2px solid #28a745' }}
		>
			<div className="container">
				<Link 
					to="/" 
					className="navbar-brand"
					style={{ color: '#343a40', fontWeight: '600' }}
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
							style={{ color: '#343a40' }}
							onMouseEnter={(e) => e.target.style.color = '#28a745'}
							onMouseLeave={(e) => e.target.style.color = '#343a40'}
						>
							Categories
						</Link>
						<Link 
							to="/login-signup" 
							className="nav-link"
							style={{ color: '#343a40' }}
							onMouseEnter={(e) => e.target.style.color = '#28a745'}
							onMouseLeave={(e) => e.target.style.color = '#343a40'}
						>
							Login/Signup
						</Link>
						<Link 
							to="/about-us" 
							className="nav-link"
							style={{ color: '#343a40' }}
							onMouseEnter={(e) => e.target.style.color = '#28a745'}
							onMouseLeave={(e) => e.target.style.color = '#343a40'}
						>
							About Us
						</Link>
						<Link 
							to="/list-your-charity" 
							className="nav-link"
							style={{ 
								color: '#28a745', 
								fontWeight: '600', 
								border: '1px solid #28a745',
								borderRadius: '5px',
								padding: '8px 12px'
							}}
							onMouseEnter={(e) => {
								e.target.style.backgroundColor = '#28a745';
								e.target.style.color = '#fff';
							}}
							onMouseLeave={(e) => {
								e.target.style.backgroundColor = 'transparent';
								e.target.style.color = '#28a745';
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