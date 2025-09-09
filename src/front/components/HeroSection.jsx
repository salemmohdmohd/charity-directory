import React from 'react'
import { Link } from 'react-router-dom'


export const HeroSection = () => {
  return (
    <header
    className='bg-primary text-white text-center py-5 d-flex align-items-center hero-ghibli'
    style={{
        backgroundImage: 'url(Hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '500px',
        textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7), 1px 1px 4px rgba(0, 0, 0, 0.5)'
        }}
        >
        <div className='container'>
            <h1 className='display-3 fw-bold mb-3 magical-title' style={{textShadow: '3px 3px 10px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(74, 124, 89, 0.4)'}}>
                Every Act of Kindness Creates Magic
            </h1>
            <p className='lead fw-bold mb-4 enchanted-text' style={{textShadow: '2px 2px 6px rgba(0, 0, 0, 0.7), 1px 1px 3px rgba(74, 124, 89, 0.3)'}}>
                Connect with causes that spark wonder and change lives. Your compassion is the seed that grows into extraordinary impact.
            </p>
            <Link to="/about-us" className='btn calcifer-button btn-lg float-magic px-5 py-3'>
                Discover Your Cause ✨
            </Link>
        </div>
    </header>
  );
};

export default HeroSection
