import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/tasks/[id]';

jest.mock('@/lib/db', () => ({
  getDb: () => ({
    prepare: () => ({
      get: () => ({ id: 1, title: 'Task', description: null, status: 'pending', priority: 'high', due_date: '2025-01-01', contact_id: 1, contact_name: 'Jane Doe', created_at: '2025-01-01', updated_at: '2025-01-01' }),
      run: () => ({}),
    }),
  }),
  isSupabase: () => false,
}));

describe('/api/tasks/[id]', () => {
  it('GET returns task', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '1' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toHaveProperty('title');
  });

  it('DELETE returns success', async () => {
    const { req, res } = createMocks({ method: 'DELETE', query: { id: '1' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
  });
});