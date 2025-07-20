import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const limit = 10;

  const fetchItems = useCallback(async (active = true, retries = 3) => {
    let attempt = 0;
    while (attempt < retries && active) { // retry logic with up to 3 attempts and a 1-second delay between retries
      try {//This assumes the backend now respects limit, page, and q parameters, fixing the intentional bug.
        const url = `http://localhost:3001/api/items?limit=${limit}&page=${currentPage}&q=${encodeURIComponent(query)}`; 
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) throw new Error('Failed to fetch items. Please try again later.');
        const data = await res.json();
        if (active) {
          setItems(data);
          // Fetch total count for pagination
          const totalUrl = `http://localhost:3001/api/items?q=${encodeURIComponent(query)}`;
          const totalRes = await fetch(totalUrl, { mode: 'cors' });
          if (!totalRes.ok) throw new Error('Failed to fetch total items.');
          const totalData = await totalRes.json();
          setTotal(totalData.length);
          setTotalPages(Math.ceil(totalData.length / limit));
          setError(null);
        }
        return;
      } catch (error) {
        attempt++;
        if (attempt === retries && active) {
          console.error('Fetch error after retries:', error.message);
          setItems([]);
          setTotal(0);
          setTotalPages(1);
          setError(error.message);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }, [currentPage, query, limit]);

  return (
    <DataContext.Provider value={{ items,total,totalPages,currentPage,setCurrentPage,setQuery, fetchItems,error }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);