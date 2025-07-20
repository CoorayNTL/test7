import React, { useEffect, useState, useCallback } from 'react';
import { useData } from '../state/DataContext';
import { FixedSizeList } from 'react-window';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';

//component for react-window
const Row = React.memo(({ index, style, data }) => {
  const item = data[index];
  return (
    <div style={style} className="border-b border-gray-200 py-2" role="listitem">
      <Link
        to={`/items/${item.id}`}
        className="flex justify-between items-center hover:bg-gray-100 p-2 rounded transition-colors duration-150"
        aria-label={`View details for ${item.name}`}
      >
        <span className="text-gray-800">{item.name}</span>
      </Link>
    </div>
  );
});

function Items() {
  const { items, fetchItems, currentPage, setCurrentPage, setQuery, totalPages, error } = useData();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Memoize handleSearch to prevent unnecessary re-renders
  const handleSearch = useCallback(
    debounce((value) => {
      setQuery(value);
      setCurrentPage(1); // Reset to first page on search
    }, 300),
    [setQuery, setCurrentPage]
  );

  // Memoize handlePageChange
  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages, setCurrentPage]
  );

  // Handle input change for search
  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    handleSearch(value);
  };

  // Fetch items with memory leak prevention
  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchItems(active).then(() => {
      if (active) setLoading(false);
    }).catch(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      handleSearch.cancel(); // Cancel debounced calls on unmount
    };
  }, [fetchItems, handleSearch]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Items List</h1>
      <label htmlFor="search" className="sr-only">Search items by name</label>
      <input
        id="search"
        type="text"
        value={search}
        onChange={onSearchChange}
        placeholder="Search items..."
        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Search items by name"
      />
      {error && (
        <div className="text-red-500 mb-4" role="alert">
          <p>{error}</p>
          <button
            onClick={() => fetchItems(true).then(() => setLoading(false)).catch(() => setLoading(false))}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            aria-label="Retry fetching items"
          >
            Retry
          </button>
        </div>
      )}
      {loading ? (
        <div className="space-y-2" aria-live="polite">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-300 animate-pulse rounded flex justify-between items-center p-2">
              <div className="w-3/4 h-6 bg-gray-400 rounded"></div>
              <div className="w-1/4 h-6 bg-gray-400 rounded"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-600" role="status">No items found.</p>
      ) : (
        <>
          <FixedSizeList
            height={400}
            width="100%"
            itemCount={items.length}
            itemSize={60} // Consider VariableSizeList if item heights vary
            overscanCount={10} // Pre-render 10 items outside viewport for smooth scrolling
            itemData={items}
            aria-label="Items list"
          >
            {Row}
          </FixedSizeList>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Items;