import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/contacts/[id]/index';

jest.mock('@/lib/db', () => ({
  getDb: () => ({
    prepare: () => ({
      get: (id: number) => id === 999 ? undefined : { id: 1, first_name: 'Jane', last_name: 'Doe', email: 'j@a.com', phone: '555', company: 'Acme', notes: '', created_at: '2025-01-01', updated_at: '2025-01-01' },
      run: () => ({}),
    }),
  }),
  isSupabase: () => false,
}));

describe('/api/contacts/[id]', () => {
  it('GET returns contact', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '1' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('first_name');
  });

  it('GET returns 400 for invalid id', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: 'abc' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });

  it('DELETE returns success', async () => {
    const { req, res } = createMocks({ method: 'DELETE', query: { id: '1' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
  });
});