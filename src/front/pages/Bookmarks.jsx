// src/front/pages/Bookmarks.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookmarks, removeBookmark } from '../data/userAuth';
import useGlobalReducer from '../hooks/useGlobalReducer';

const Bookmarks = () => {
  const { store, dispatch } = useGlobalReducer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const bookmarksData = await getBookmarks();
        dispatch({ type: 'SET_BOOKMARKS', payload: bookmarksData });
      } catch (err) {
        setError(err.message || 'Failed to fetch bookmarks.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [dispatch]);

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await removeBookmark(bookmarkId);
      // Refetch bookmarks after removal
      const bookmarksData = await getBookmarks();
      dispatch({ type: 'SET_BOOKMARKS', payload: bookmarksData });
    } catch (err) {
      setError(err.message || 'Failed to remove bookmark.');
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading your bookmarks...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Bookmarked Organizations</h2>
      {store.userBookmarks && store.userBookmarks.length > 0 ? (
        <div className="list-group">
          {store.userBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <div>
                <Link to={`/organizations/${bookmark.organization.id}`}>
                  <h5 className="mb-1">{bookmark.organization.name}</h5>
                </Link>
                <p className="mb-1 text-muted">{bookmark.organization.category}</p>
              </div>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleRemoveBookmark(bookmark.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-5 border rounded">
          <p>You haven't bookmarked any organizations yet.</p>
          <Link to="/search" className="btn btn-primary">Find Organizations</Link>
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
