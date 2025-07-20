import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemDetail from './ItemDetail';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('ItemDetail Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', async () => {
    fetchMock.mockResponseOnce(() => new Promise(() => {}));
    render(
      <MemoryRouter initialEntries={['/items/1']}>
        <Routes>
          <Route path="/items/:id" element={<ItemDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toHaveClass('animate-pulse');
  });

  it('renders item details', async () => {
    const mockItem = { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 };
    fetchMock.mockResponseOnce(JSON.stringify(mockItem));
    render(
      <MemoryRouter initialEntries={['/items/1']}>
        <Routes>
          <Route path="/items/:id" element={<ItemDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /laptop pro/i })).toBeInTheDocument();
      expect(screen.getByTestId('category')).toHaveTextContent('Category: Electronics');
      expect(screen.getByTestId('price')).toHaveTextContent('Price: $2499');
      expect(screen.getByRole('button', { name: /back to items list/i })).toBeInTheDocument();
    });
  });

  it('displays error and navigates on 404', async () => {
    fetchMock.mockResponseOnce('', { status: 404 });
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);

    render(
      <MemoryRouter initialEntries={['/items/999']}>
        <Routes>
          <Route path="/items/:id" element={<ItemDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Item not found');
      expect(navigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles back button navigation', async () => {
    const mockItem = { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 };
    fetchMock.mockResponseOnce(JSON.stringify(mockItem));
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);

    render(
      <MemoryRouter initialEntries={['/items/1']}>
        <Routes>
          <Route path="/items/:id" element={<ItemDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /laptop pro/i })).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to items list/i });
    await userEvent.click(backButton);
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('tests accessibility', async () => {
    const mockItem = { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 };
    fetchMock.mockResponseOnce(JSON.stringify(mockItem));
    render(
      <MemoryRouter initialEntries={['/items/1']}>
        <Routes>
          <Route path="/items/:id" element={<ItemDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Laptop Pro');
      expect(screen.getByRole('button', { name: /back to items list/i })).toHaveClass('focus:ring-blue-500');
    });
  });
});