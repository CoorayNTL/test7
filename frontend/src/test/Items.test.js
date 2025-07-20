import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixedSizeList } from 'react-window';
import Items, { Row } from './Items';
import { DataProvider, useData } from '../state/DataContext';
import { MemoryRouter } from 'react-router-dom';

// Mock react-window
jest.mock('react-window', () => ({
  FixedSizeList: jest.fn(({ children, itemData, height, itemSize, itemCount, width }) =>
    children({ index: 0, style: { height: itemSize, width } })
  ),
}));

// Mock DataContext
const mockItems = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
  { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
];
const mockFetchItems = jest.fn();
const mockDataContext = {
  items: mockItems,
  fetchItems: mockFetchItems,
  currentPage: 1,
  setCurrentPage: jest.fn(),
  setQuery: jest.fn(),
  totalPages: 2,
  error: null,
};

// jest.mock('../DataContext', () => ({
//   ...jest.requireActual('../DataContext'),
//   useData: jest.fn(),
// }));

describe('Items Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useData.mockReturnValue(mockDataContext);
    fetchMock.resetMocks();
  });

  it('renders the items list with title and search input', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <Items />
        </DataProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /items list/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/search items by name/i)).toBeInTheDocument();
    expect(FixedSizeList).toHaveBeenCalled();
  });

  it('displays skeleton loading state', async () => {
    useData.mockReturnValue({ ...mockDataContext, items: [], fetchItems: async () => new Promise(() => {}) });
    render(
      <MemoryRouter>
        <DataProvider>
          <Items />
        </DataProvider>
      </MemoryRouter>
    );

    expect(screen.getAllByRole('status')[0]).toHaveClass('animate-pulse');
    expect(screen.getAllByRole('status')).toHaveLength(10);
  });

  it('displays error message', async () => {
    useData.mockReturnValue({ ...mockDataContext, items: [], error: 'Failed to fetch items' });
    render(
      <MemoryRouter>
        <DataProvider>
          <Items />
        </DataProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch items');
  });

  it('displays no items found when empty', async () => {
    useData.mockReturnValue({ ...mockDataContext, items: [] });
    render(
      <MemoryRouter>
        <DataProvider>
          <Items />
        </DataProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('No items found');
    });
  });

  it('renders items with virtualization', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <Items />
        </DataProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    expect(screen.getByText('$2499')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveClass('border-b');
  });

  it('handles search input', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <Items />
        </DataProvider>
      </MemoryRouter>
    );

    const searchInput = screen.getByLabelText(/search items by name/i);
    await userEvent.type(searchInput, 'laptop');
    expect(mockDataContext.setQuery).toHaveBeenCalledWith('laptop');
    expect(mockDataContext.setCurrentPage).toHaveBeenCalledWith(1);
  });

  it('handles pagination', async () => {
    render(
      <MemoryRouter>
        <DataProvider>
          <Items />
        </DataProvider>
      </MemoryRouter>
    );

    const nextButton = screen.getByRole('button', { name: /next page/i });
    await userEvent.click(nextButton);
    expect(mockDataContext.setCurrentPage).toHaveBeenCalledWith(2);

    const prevButton = screen.getByRole('button', { name: /previous page/i });
    await userEvent.click(prevButton);
    expect(mockDataContext.setCurrentPage).toHaveBeenCalledWith(0);
  });

  it('disables pagination buttons correctly', async () => {
    useData.mockReturnValue({ ...mockDataContext, currentPage: 1, totalPages: 1 });
    render(
      <MemoryRouter>
        <DataProvider>
          <Items />
        </DataProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });

  it('tests Row component accessibility', async () => {
    const item = mockItems[0];
    render(<Row index={0} style={{}} data={mockItems} />);

    const link = screen.getByRole('link', { name: /view details for laptop pro/i });
    expect(link).toHaveAttribute('href', '/items/1');
    expect(link).toHaveClass('focus:ring-blue-500');
  });
});