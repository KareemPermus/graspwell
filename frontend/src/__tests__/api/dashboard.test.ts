import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/dashboard';

jest.mock('@/lib/db', () => ({
  getDb: () => {
    const db: any = {
      prepare: (sql: string) => ({
        get: () => {
          if (sql.includes('COUNT') && sql.includes('contacts')) return { c: 3 };
          if (sql.includes('COUNT') && sql.includes('tasks') && sql.includes('date')) return { c: 1 };
          if (sql.includes('COUNT') && sql.includes('tasks')) return { c: 5 };
          return { c: 0 };
        },
        all: () => {
          if (sql.includes('contacts')) return [{ id: 1, first_name: 'Jane', last_name: 'Doe', company: 'Acme' }];
          return [{ id: 1, title: 'Task 1', status: 'pending', due_date: '2025-01-01' }];
        },
      }),
    };
    return db;
  },
  isSupabase: () => false,
}));

describe('/api/dashboard', () => {
  it('returns dashboard stats on GET', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('total_contacts');
    expect(data).toHaveProperty('total_tasks');
    expect(data).toHaveProperty('tasks_due_today');
    expect(data).toHaveProperty('recent_contacts');
    expect(data).toHaveProperty('upcoming_tasks');
  });

  it('returns 405 on POST', async () => {
    const { req, res } = createMocks({ method: 'POST' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(405);
  });
});