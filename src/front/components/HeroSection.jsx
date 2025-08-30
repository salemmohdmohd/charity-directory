import React from 'react'


export const HeroSection = () => {
  return (
    <header 
    className='text-white text-center py-5 position-relative'
    style={{minHeight: '500px', overflow: 'hidden' }}
    >
    
    <video
    autoPlay
    muted
    loop
    className='position-absolute top-0 start-0 w-100 h-100'
    style={{
        objectFit: 'cover',
        zIndex: -1
    }}
    >
        < source src='https://https://www.pexels.com/video/a-low-angle-shot-of-a-woman-giving-boxes-6646688/' type='video/mp4'/>
        Your browser does not support the video tag.
    </video>
        <div className='container'>
            <h1 className='display-4 mb-3'>Without You There Is No Us</h1>
            <p className='lead mb-4'>
                Support For Your Causes
            </p>
            <button className='btn btn-light btn-lg'>Learn More</button>
        </div>
    </header>
  );
};

export default HeroSection
