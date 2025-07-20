import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { //This ensures that setItem, setLoading, and setError are only called if the component is still mounted, fixing the memory leak.
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`http://localhost:3001/api/items/${id}`, { mode: 'cors' })
      .then(res => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Item not found' : 'Failed to fetch item');
        return res.json();
      })
      .then(data => {
        if (active) {
          setItem(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          setError(err.message);
          setLoading(false);
          navigate('/');
        }
      });

    return () => {
      active = false; 
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" role="status" aria-live="polite">
        <div className="space-y-3">
          <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-6 w-1/2 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <p className="text-red-600 bg-red-50 p-3 rounded-lg" role="alert">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4" role="heading" aria-level="2">
          {item.name}
        </h2>
        <div className="space-y-2">
          <p className="text-gray-700" data-testid="category">
            Category: {item.category}
          </p>
          <p className="text-gray-700" data-testid="price">
            Price: ${item.price}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          aria-label="Back to items list"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
}

export default ItemDetail;