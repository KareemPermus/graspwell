import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Tasks from '@/pages/tasks';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const mockTasks = [
  { id: 1, title: 'Fix bug', status: 'pending', priority: 'high', due_date: '2024-06-01', contact_id: 1, contact_name: 'John Doe', created_at: '2024-01-01' },
  { id: 2, title: 'Write docs', status: 'completed', priority: 'low', due_date: '', contact_id: null, contact_name: '', created_at: '2024-01-02' },
];

beforeEach(() => {
  (apiClient.get as jest.Mock).mockImplementation((url: string) => {
    if (url === '/api/tasks') return Promise.resolve({ data: mockTasks });
    if (url === '/api/contacts') return Promise.resolve({ data: [] });
    if (url.startsWith('/api/tasks/')) return Promise.resolve({ data: { ...mockTasks[0], description: 'desc', updated_at: '2024-01-01' } });
    return Promise.resolve({ data: [] });
  });
});

test('renders tasks table', async () => {
  render(<Tasks />);
  await waitFor(() => expect(screen.getByText('Fix bug')).toBeInTheDocument());
  expect(screen.getByText('Write docs')).toBeInTheDocument();
});

test('filters by status', async () => {
  render(<Tasks />);
  await waitFor(() => expect(screen.getByText('Fix bug')).toBeInTheDocument());
  fireEvent.change(screen.getByDisplayValue('All Statuses'), { target: { value: 'completed' } });
  expect(screen.queryByText('Fix bug')).not.toBeInTheDocument();
  expect(screen.getByText('Write docs')).toBeInTheDocument();
});

test('opens create modal', async () => {
  render(<Tasks />);
  await waitFor(() => screen.getByText('Fix bug'));
  fireEvent.click(screen.getByText('New Task'));
  expect(screen.getByText('Create New Task')).toBeInTheDocument();
});

test('search filters tasks', async () => {
  render(<Tasks />);
  await waitFor(() => screen.getByText('Fix bug'));
  fireEvent.change(screen.getByPlaceholderText('Search tasks…'), { target: { value: 'docs' } });
  expect(screen.queryByText('Fix bug')).not.toBeInTheDocument();
  expect(screen.getByText('Write docs')).toBeInTheDocument();
});