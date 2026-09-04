import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/contacts/[id]/activities';

jest.mock('@/lib/db', () => ({
  getDb: () => ({
    prepare: () => ({
      all: () => [{ id: 1, type: 'call', description: 'Test', task_id: null, created_at: '2025-01-01' }],
      run: () => ({ lastInsertRowid: 2 }),
      get: () => ({ id: 2, contact_id: 1, type: 'email', description: 'Sent', task_id: null, created_at: '2025-01-01' }),
    }),
  }),
  isSupabase: () => false,
}));

describe('/api/contacts/[id]/activities', () => {
  it('GET returns activities', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '1' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(Array.isArray(JSON.parse(res._getData()))).toBe(true);
  });

  it('POST creates activity', async () => {
    const { req, res } = createMocks({ method: 'POST', query: { id: '1' }, body: { type: 'call', description: 'Called' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
  });

  it('POST returns 400 without required fields', async () => {
    const { req, res } = createMocks({ method: 'POST', query: { id: '1' }, body: {} });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});