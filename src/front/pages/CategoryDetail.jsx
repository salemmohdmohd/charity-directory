import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { OrganizationCard } from '../components';
import { categoryService, organizationService } from '../Services/axios';

const CategoryDetail = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const perPage = 12; // Show more organizations per page

  // Fetch category and organizations
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch category and organizations in one go
        const categoryData = await categoryService.getCategoryBySlug(categorySlug, {
          page: currentPage,
          per_page: perPage,
          include_organizations: true, // Ask backend to include organizations
        });

        if (!categoryData || !categoryData.category) {
          setError('Category not found');
          setLoading(false);
          return;
        }

        setCategory(categoryData.category);
        setOrganizations(categoryData.organizations || []);
        setTotalPages(categoryData.total_pages || 1);
        setTotalCount(categoryData.total_count || 0);

        dispatch({
          type: 'SET_NOTIFICATION',
          payload: null,
        });
      } catch (error) {
        console.error('Error fetching category data:', error);
        setError('Failed to load category information. Please try again.');
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to load category information.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categorySlug, currentPage, dispatch]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate category description for SEO
  const getCategoryDescription = () => {
    if (!category) return '';
    return `Discover ${totalCount} verified ${category.name.toLowerCase()} organizations making a difference in their communities. Find trusted charities and non-profits in the ${category.name} category.`;
  };

  // Convert organization name to URL-friendly slug
  const createOrgSlug = (org) => {
    return `${org.id}-${org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading category information...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <>
        <Helmet>
          <title>Category Not Found - Charity Directory</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <main className="container my-5">
          <div className="text-center">
            <h1 className="display-4 text-danger">Category Not Found</h1>
            <p className="lead">The category you're looking for doesn't exist.</p>
            <Link to="/categories" className="btn btn-primary btn-lg">
              Browse All Categories
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} Organizations - Charity Directory</title>
        <meta name="description" content={getCategoryDescription()} />
        <meta name="keywords" content={`${category.name}, charity, nonprofit, organizations, donations, volunteer`} />
        <link rel="canonical" href={`${window.location.origin}/categories/${categorySlug}`} />

        {/* Open Graph tags */}
        <meta property="og:title" content={`${category.name} Organizations - Charity Directory`} />
        <meta property="og:description" content={getCategoryDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/categories/${categorySlug}`} />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${category.name} Organizations - Charity Directory`} />
        <meta name="twitter:description" content={getCategoryDescription()} />

        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `${category.name} Organizations`,
            "description": getCategoryDescription(),
            "url": `${window.location.origin}/categories/${categorySlug}`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": totalCount,
              "itemListElement": organizations.map((org, index) => ({
                "@type": "Organization",
                "position": index + 1,
                "name": org.name,
                "description": org.mission,
                "url": `${window.location.origin}/organizations/${createOrgSlug(org)}`,
                "address": org.location
              }))
            }
          })}
        </script>
      </Helmet>

      <main className="container my-5">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/categories" className="text-decoration-none">Categories</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {category.name}
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <header className="mb-5">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="display-4 mb-3 text-forest">{category.name} Organizations</h1>
              <p className="lead text-muted">
                {getCategoryDescription()}
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="bg-totoro p-3 rounded">
                <h3 className="h5 mb-1">Total Organizations</h3>
                <span className="display-6 fw-bold text-primary">{totalCount}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Organizations Grid */}
        <section aria-labelledby="organizations-heading">
          <h2 id="organizations-heading" className="visually-hidden">
            {category.name} Organizations List
          </h2>

          {organizations.length === 0 ? (
            <div className="text-center py-5">
              <h3 className="h4 text-muted">No organizations found</h3>
              <p className="text-muted">There are currently no organizations in this category.</p>
              <Link to="/list-your-charity" className="btn btn-outline-primary">
                List Your Organization
              </Link>
            </div>
          ) : (
            <>
              <div className="row">
                {organizations.map((organization) => (
                  <div key={organization.id} className="col-md-6 col-lg-4 mb-4">
                    <OrganizationCard
                      organization={organization}
                      categoryColorCode={category?.color_code}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Organizations pagination" className="mt-5">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                      >
                        Previous
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pageNum)}
                            aria-label={`Page ${pageNum}`}
                            aria-current={currentPage === pageNum ? 'page' : undefined}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    })}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </section>

        {/* Call to Action */}
        <section className="mt-5 p-4 bg-totoro rounded">
          <div className="text-center">
            <h2 className="h4 mb-3">Don't see your organization?</h2>
            <p className="mb-3">Join our directory and connect with supporters in your community.</p>
            <Link to="/list-your-charity" className="btn calcifer-button btn-lg">
              List Your Organization
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default CategoryDetail;
