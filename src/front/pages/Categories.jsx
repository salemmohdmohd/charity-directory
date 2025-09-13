import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { OrganizationCard } from '../components';
import { categoryService, organizationService } from '../Services/axios';

const Categories = () => {
  const { store, dispatch } = useGlobalReducer();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesWithOrgs, setCategoriesWithOrgs] = useState([]);
  const [error, setError] = useState(null);

  // Function to create URL-friendly slug from category name
  const createCategorySlug = (categoryName) => {
    return categoryName.toLowerCase().replace(/\s+/g, '-');
  };

  // Function to create organization slug
  const createOrgSlug = (org) => {
    return `${org.id}-${org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  };

  // Function to fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories and their organizations in a single, optimized call
      const data = await categoryService.getCategories(true); // true to include organizations

      setCategories(data); // The API now returns the full nested structure
      setCategoriesWithOrgs(data);

      console.log('Categories with organizations loaded:', data);

    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');

      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load categories.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="forest-spinner mx-auto mb-4"></div>
            <h5 className="text-forest">Loading Categories...</h5>
            <p className="text-muted">Please wait while we fetch the latest categories and organizations</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="totoro-card p-5">
              <i className="fas fa-exclamation-triangle text-sunset mb-3" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-forest mb-3">Oops! Something went wrong</h5>
              <p className="text-muted mb-4">{error}</p>
              <button
                className="btn calcifer-button"
                onClick={fetchCategories}
              >
                <i className="fas fa-sync-alt me-2"></i>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Charity Categories - Find Organizations by Cause</title>
        <meta name="description" content="Browse charity categories and discover verified nonprofit organizations making a difference. Find causes you care about and connect with organizations in your community." />
        <meta name="keywords" content="charity categories, nonprofit organizations, donations, volunteer, causes, community service" />
        <link rel="canonical" href={`${window.location.origin}/categories`} />

        {/* Open Graph tags */}
        <meta property="og:title" content="Charity Categories - Find Organizations by Cause" />
        <meta property="og:description" content="Browse charity categories and discover verified nonprofit organizations making a difference." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/categories`} />

        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Charity Categories",
            "description": "Browse charity categories and discover verified nonprofit organizations making a difference.",
            "url": `${window.location.origin}/categories`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": categoriesWithOrgs.length,
              "itemListElement": categoriesWithOrgs.map((category, index) => ({
                "@type": "Thing",
                "position": index + 1,
                "name": category.name,
                "description": category.description,
                "url": `${window.location.origin}/categories/${createCategorySlug(category.name)}`
              }))
            }
          })}
        </script>
      </Helmet>

      <div className="min-vh-100 bg-light">
        {/* Enhanced Header Section */}
        <header
          className="bg-primary text-white text-center py-5 d-flex align-items-center hero-ghibli"
          style={{
            backgroundImage: 'url(/Category-Hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '400px',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7), 1px 1px 4px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="container">
            <h1 className="display-3 fw-bold mb-3 magical-title" style={{textShadow: '3px 3px 10px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(74, 124, 89, 0.4)'}}>
              Discover Causes That Matter
            </h1>
            <p className="lead fw-bold mb-4 enchanted-text" style={{textShadow: '2px 2px 6px rgba(0, 0, 0, 0.7), 1px 1px 3px rgba(74, 124, 89, 0.3)'}}>
              Explore charity categories and find organizations making real-world impact in areas you care about
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/search" className="btn calcifer-button btn-lg float-magic px-4 py-2">
                <i className="fas fa-search me-2"></i> Search Charities
              </Link>
              <Link to="/list-your-charity" className="btn btn-outline-light btn-lg px-4 py-2">
                <i className="fas fa-plus-circle me-2"></i> Add Your Organization
              </Link>
            </div>
          </div>
        </header>

        {/* Categories and Organizations Section */}
        <main className="py-5">
          <div className="container">
            {/* Introduction */}
            <div className="row mb-5">
              <div className="col-12 text-center">
                <h2 className="h3 text-forest mb-3">Browse Charitable Categories</h2>
                <p className="text-muted mb-4">Each category represents a unique cause where organizations are making a difference</p>
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  {categoriesWithOrgs.map(category => (
                    <Link
                      key={category.id}
                      to={`/categories/${createCategorySlug(category.name)}`}
                      className="badge text-decoration-none px-3 py-2 m-1"
                      style={{
                        backgroundColor: `${category.color_code || '#28a745'}22`,
                        color: category.color_code || '#28a745',
                        border: `1px solid ${category.color_code || '#28a745'}`,
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {categoriesWithOrgs.length === 0 ? (
              <div className="row justify-content-center">
                <div className="col-lg-6 text-center">
                  <div className="totoro-card p-5 shadow-sm">
                    <i className="fas fa-info-circle text-muted mb-3" style={{ fontSize: '2rem' }}></i>
                    <h2 className="h5 text-muted">No categories available</h2>
                    <p className="text-muted">Categories will appear here once they're added</p>
                    <button
                      className="btn calcifer-button"
                      onClick={fetchCategories}
                    >
                      <i className="fas fa-sync-alt me-2"></i>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              categoriesWithOrgs.map((category, categoryIndex) => (
                <section key={category.id} className="mb-5">
                  {/* Category Header */}
                  <header className="row mb-4">
                    <div className="col-12">
                      <div
                        className="p-4 rounded-4 shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, white, ${category.color_code}15)`,
                          borderLeft: `5px solid ${category.color_code || '#28a745'}`
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle me-3 p-2 shadow-sm d-flex align-items-center justify-content-center"
                              style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: category.color_code || '#28a745',
                                flexShrink: 0
                              }}
                            >
                              <i className="fas fa-hands-helping text-white" style={{ fontSize: '1.5rem' }}></i>
                            </div>
                            <div>
                              <h2 className="magical-title text-forest mb-0" style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>
                                {category.name}
                              </h2>
                              <span className="badge rounded-pill" style={{
                                backgroundColor: `${category.color_code || '#28a745'}22`,
                                color: category.color_code || '#28a745',
                                border: `1px solid ${category.color_code || '#28a745'}22`,
                                fontSize: '0.9rem'
                              }}>
                                {category.organization_count || 0} Organizations
                              </span>
                            </div>
                          </div>
                          <Link
                            to={`/categories/${createCategorySlug(category.name)}`}
                            className="btn btn-outline-primary"
                            style={{
                              borderColor: category.color_code,
                              color: category.color_code
                            }}
                          >
                            View All
                            <i className="fas fa-arrow-right ms-2"></i>
                          </Link>
                        </div>
                        {category.description && (
                          <p className="text-muted fs-5 mt-3 mb-0">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </header>

                  {/* Organizations Preview */}
                  {category.organizations && category.organizations.length > 0 ? (
                    <div className="row g-4 mb-4">
                      {category.organizations.map((organization) => (
                        <div key={organization.id} className="col-md-6 col-lg-4">
                          <OrganizationCard
                            organization={organization}
                            categoryColorCode={category.color_code}
                            onCardClick={(org) => {
                              const orgSlug = createOrgSlug(org);
                              window.location.href = `/organizations/${orgSlug}`;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="text-center py-4" style={{
                          backgroundColor: '#f8f9fa',
                          borderRadius: '1rem',
                          border: '2px dashed #dee2e6'
                        }}>
                          <i className="fas fa-info-circle text-muted mb-2" style={{ fontSize: '1.5rem' }}></i>
                          <p className="text-muted mb-1">No organizations yet in this category</p>
                          <Link to="/list-your-charity" className="btn btn-sm btn-outline-primary">
                            Be the first to list here
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Divider between categories (except last one) */}
                  {categoryIndex < categoriesWithOrgs.length - 1 && (
                    <div className="position-relative my-5">
                      <hr style={{
                        height: '2px',
                        background: `linear-gradient(90deg, transparent, ${category.color_code || '#28a745'}, transparent)`,
                        border: 'none'
                      }} />
                      <div className="position-absolute top-50 start-50 translate-middle bg-white px-4">
                        <i className="fas fa-seedling" style={{
                          color: category.color_code || '#28a745',
                          fontSize: '1.2rem'
                        }}></i>
                      </div>
                    </div>
                  )}
                </section>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Categories;
