import React from 'react';
import { Link } from 'react-router-dom';

export const StatCounter = ({ value, label }) => (
  <div className="col-md-3 col-6 mb-4 mb-md-0">
    <div className="bg-white bg-opacity-25 rounded-4 p-3 transform-hover">
      <h2 className="fw-bold  display-4 mb-0">{value}</h2>
      <p className="mb-0 fw-semibold">{label}</p>
    </div>
  </div>
);

export const MissionFeatureCard = ({ icon, title, description, link, linkText }) => (
  <div className="col-md-6">
    <div className="card h-100 border-0 shadow-lg rounded-4 transform-hover">
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-3">
          <div className="bg-ghibli-green text-white rounded-circle p-3 me-3 shadow-sm">
            <i className={`fas ${icon} fa-lg`}></i>
          </div>
          <h4 className="mb-0 text-ghibli-green fw-bold">{title}</h4>
        </div>
        <p className="text-muted fs-5">{description}</p>
        <div className="mt-4 text-end">
          <Link to={link} className="text-ghibli-green fw-semibold text-decoration-none">
            {linkText} <i className="fas fa-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export const ChallengeStatCard = ({ value, title, description, icon, color }) => (
    <div className="col-md-4">
        <div className="card border-0 shadow-lg rounded-4 h-100 p-4 transform-hover">
            <div className="text-center">
                <div className={`bg-${color} text-white rounded-circle p-3 mx-auto mb-4 shadow`} style={{
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem'
                }}>
                    <h2 className="mb-0 display-6">{value}</h2>
                </div>
                <h4 className={`text-${color} mb-3`}>{title}</h4>
                <p className="text-muted">{description}</p>
                <div className="mt-3">
                    <i className={`fas ${icon} fa-2x text-${color} opacity-25`}></i>
                </div>
            </div>
        </div>
    </div>
);

export const SolutionCard = ({ icon, title, description, stat, statIcon, step }) => (
    <div className="col-lg-4 col-md-6">
        <div className="card h-100 border-0 shadow-lg rounded-4 transform-hover">
            <div className="card-body p-4 text-center">
                <div className="mb-4 position-relative">
                    <div className="rounded-circle bg-ghibli-green bg-opacity-10 p-4 mx-auto" style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`${icon} text-ghibli-green`} style={{ fontSize: '2.5rem' }}></i>
                    </div>
                    {step && (
                        <div className="position-absolute top-0 start-50 translate-middle-x" style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '50%',
                            border: '2px solid #4a7c59',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            color: '#4a7c59',
                            fontWeight: 'bold'
                        }}>{step}</div>
                    )}
                </div>
                <h5 className="card-title text-ghibli-green fw-bold mb-3">{title}</h5>
                <p className="card-text text-muted mb-4">{description}</p>
                <div className="mt-3 p-2 bg-success bg-opacity-10 rounded-3">
                    <small className="text-success fw-semibold">
                        <i className={`fas ${statIcon} me-1`}></i>
                        {stat}
                    </small>
                </div>
            </div>
        </div>
    </div>
);

export const ImpactStatCard = ({ icon, value, description }) => (
    <div className="col-lg-3 col-md-6">
        <div className="bg-white bg-opacity-10 rounded-4 p-4 text-center h-100 transform-hover">
            <div className="mb-4">
                <div className="rounded-circle bg-white p-3 mx-auto" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fas ${icon} text-ghibli-green`} style={{ fontSize: '2.5rem' }}></i>
                </div>
            </div>
            <h2 className="fw-bold  display-5 mb-3">{value}</h2>
            <p className="mb-0 fs-5">{description}</p>
        </div>
    </div>
);

export const HowItWorksStep = ({ step, title, description }) => (
    <div className="col-md-4">
        <div className="text-center">
            <div className="bg-ghibli-green text-white rounded-circle p-4 mx-auto mb-4" style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 className="mb-0">{step}</h2>
            </div>
            <h4 className="text-ghibli-green mb-3">{title}</h4>
            <p className="text-muted">{description}</p>
        </div>
    </div>
);
