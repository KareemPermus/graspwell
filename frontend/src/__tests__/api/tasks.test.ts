import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/tasks/index';

jest.mock('@/lib/db', () => ({
  getDb: () => ({
    prepare: (sql: string) => ({
      all: () => [{ id: 1, title: 'Task', status: 'pending', priority: 'high', due_date: '2025-01-01', contact_id: 1, created_at: '2025-01-01', contact_name: 'Jane Doe' }],
      run: () => ({ lastInsertRowid: 2 }),
      get: () => ({ id: 2, title: 'New', description: null, status: 'pending', priority: 'medium', due_date: null, contact_id: null, created_at: '2025-01-01', updated_at: '2025-01-01' }),
    }),
  }),
  isSupabase: () => false,
}));

describe('/api/tasks', () => {
  it('GET returns tasks', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(Array.isArray(JSON.parse(res._getData()))).toBe(true);
  });

  it('POST creates task', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { title: 'New Task' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
  });

  it('POST returns 400 without title', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});