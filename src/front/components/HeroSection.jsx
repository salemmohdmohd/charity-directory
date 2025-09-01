import React from 'react'


export const HeroSection = () => {
  return (
    <header 
    className='bg-primary text-white text-center py-5'
    style={{
        backgroundImage: 'url(https://fastly.picsum.photos/id/43/1280/831.jpg?hmac=glK-rQ0ppFClW-lvjk9FqEWKog07XkOxJf6Xg_cU9LI)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '800px',
        display: 'flex',
        alignItems: 'center',
        }}
        >
        <div className='container'>
            <h1 className='display-4 fw-bold mb-3'>Without You There Is No Us</h1>
            <p className='lead fw-bold mb-4'>
                Support For Your Causes
            </p>
            <button className='btn btn-light btn-lg'>Learn More</button>
        </div>
    </header>
  );
};

export default HeroSection
