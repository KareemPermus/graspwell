import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/pages/dashboard';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));

const mockData = {
  total_contacts: 5,
  total_tasks: 12,
  tasks_due_today: 3,
  recent_contacts: [{ id: 1, first_name: 'Jane', last_name: 'Doe', company: 'Acme' }],
  upcoming_tasks: [{ id: 1, title: 'Call client', status: 'todo', due_date: '2025-01-15' }],
};

describe('Dashboard page', () => {
  it('renders KPI cards and data after loading', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
    expect(screen.getByText('Total Contacts')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Call client')).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument());
  });
});