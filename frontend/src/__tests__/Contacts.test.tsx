import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Contacts from '@/pages/contacts';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() } }));

const mockContacts = [
  { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@test.com', phone: '555-1234', company: 'Acme', created_at: '2024-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@test.com', phone: '', company: '', created_at: '2024-01-02' },
];

beforeEach(() => { jest.clearAllMocks(); });

test('renders contacts table after loading', async () => {
  (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockContacts });
  render(<Contacts />);
  await waitFor(() => { expect(screen.getByText('John Doe')).toBeInTheDocument(); });
  expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  expect(screen.getByText('john@test.com')).toBeInTheDocument();
});

test('shows empty state when no contacts', async () => {
  (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: [] });
  render(<Contacts />);
  await waitFor(() => { expect(screen.getByText('No contacts found.')).toBeInTheDocument(); });
});

test('filters contacts by search', async () => {
  (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockContacts });
  render(<Contacts />);
  await waitFor(() => { expect(screen.getByText('John Doe')).toBeInTheDocument(); });
  fireEvent.change(screen.getByPlaceholderText('Search contacts…'), { target: { value: 'jane' } });
  expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  expect(screen.getByText('Jane Smith')).toBeInTheDocument();
});

test('opens create modal and submits', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: mockContacts });
  (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { id: 3, first_name: 'New', last_name: 'User' } });
  render(<Contacts />);
  await waitFor(() => { expect(screen.getByText('John Doe')).toBeInTheDocument(); });
  fireEvent.click(screen.getByText('New Contact'));
  expect(screen.getByText('Create Contact')).toBeInTheDocument();
  fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'New' } });
  fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'User' } });
  fireEvent.click(screen.getByText('Create Contact'));
  await waitFor(() => { expect(apiClient.post).toHaveBeenCalledWith('/api/contacts', expect.objectContaining({ first_name: 'New', last_name: 'User' })); });
});

test('shows error on fetch failure', async () => {
  (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('fail'));
  render(<Contacts />);
  await waitFor(() => { expect(screen.getByText('Failed to load contacts')).toBeInTheDocument(); });
});