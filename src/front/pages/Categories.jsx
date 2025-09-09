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

      const data = await categoryService.getCategories();
      setCategories(data.categories || []);

      // Fetch organizations for each category (limit 3 per category)
      const categoriesWithOrganizations = await Promise.all(
        (data.categories || []).map(async (category) => {
          try {
            const orgData = await categoryService.getOrganizationsByCategory(category.id, { per_page: 3 });
            const organizations = orgData.organizations || [];

            // Load photos for each organization
            const organizationsWithPhotos = await Promise.all(
              organizations.map(async (org) => {
                try {
                  const photos = await organizationService.getOrganizationPhotos(org.id);
                  return { ...org, photos };
                } catch (photoError) {
                  console.error(`Error loading photos for organization ${org.id}:`, photoError);
                  return { ...org, photos: [] };
                }
              })
            );

            return {
              ...category,
              organizations: organizationsWithPhotos
            };
          } catch (error) {
            console.error(`Error fetching organizations for category ${category.name}:`, error);
            return { ...category, organizations: [] };
          }
        })
      );

      setCategoriesWithOrgs(categoriesWithOrganizations);

      console.log('Categories with organizations loaded:', categoriesWithOrganizations);

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
        {/* Header Section */}
        <header className="bg-totoro py-5">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <h1 className="magical-title display-4 fw-bold text-cream mb-3 float-magic">
                  Charity Categories
                </h1>
                <p className="enchanted-text lead text-cream fs-5">
                  Explore causes and discover organizations making a difference
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Categories and Organizations Section */}
        <main className="py-5">
          <div className="container">
            {categoriesWithOrgs.length === 0 ? (
              <div className="row justify-content-center">
                <div className="col-lg-6 text-center">
                  <div className="totoro-card p-5">
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
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle me-3"
                            style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: category.color_code || '#28a745',
                              flexShrink: 0
                            }}
                          ></div>
                          <h2 className="magical-title text-forest mb-0" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                            {category.name} ({category.organization_count || 0})
                          </h2>
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
                        <p className="text-muted lead fs-5 ms-5">
                          {category.description}
                        </p>
                      )}
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
                            onWebsiteClick={(url) => {
                              window.open(url, '_blank', 'noopener,noreferrer');
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
                    <hr className="my-5" style={{
                      height: '2px',
                      background: `linear-gradient(90deg, transparent, ${category.color_code || '#28a745'}, transparent)`,
                      border: 'none'
                    }} />
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
