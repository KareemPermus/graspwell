import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/contacts/index';

jest.mock('@/lib/db', () => ({
  getDb: () => ({
    prepare: (sql: string) => ({
      all: () => [{ id: 1, first_name: 'Jane', last_name: 'Doe', email: 'j@a.com', phone: '555', company: 'Acme', created_at: '2025-01-01' }],
      run: () => ({ lastInsertRowid: 2 }),
      get: () => ({ id: 2, first_name: 'New', last_name: 'Contact', email: null, phone: null, company: null, notes: null, created_at: '2025-01-01', updated_at: '2025-01-01' }),
    }),
  }),
  isSupabase: () => false,
}));

describe('/api/contacts', () => {
  it('GET returns contacts list', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('first_name');
  });

  it('POST creates contact', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { first_name: 'New', last_name: 'Contact' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
  });

  it('POST returns 400 without required fields', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});