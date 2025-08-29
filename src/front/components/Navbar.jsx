import React, { useState} from 'react';
import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">Unseen</span>
				</Link>
				<div className="ml-auto">
					<Link to="/categories">
						Categories
					</Link>
					<br/>
					<Link to="/login/signup">
						Login/Signup
					</Link>
					<br/>
					<Link to="/about us">
						About Us
					</Link>
					<br/>
					<Link to="/list your charity">
						List Your Charity +
					</Link>
				</div>
			</div>
		</nav>
	);
};