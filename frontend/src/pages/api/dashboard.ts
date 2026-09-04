import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getDb();

    if (isSupabase()) {
      const [{ count: totalContacts }, { count: totalTasks }] = await Promise.all([
        db.from('contacts').select('*', { count: 'exact', head: true }),
        db.from('tasks').select('*', { count: 'exact', head: true }),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const { count: tasksDueToday } = await db.from('tasks')
        .select('*', { count: 'exact', head: true })
        .gte('due_date', today + 'T00:00:00')
        .lte('due_date', today + 'T23:59:59');

      const { data: recentContacts } = await db.from('contacts')
        .select('id, first_name, last_name, company')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: upcomingTasks } = await db.from('tasks')
        .select('id, title, status, due_date')
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      return res.json({
        total_contacts: totalContacts || 0,
        total_tasks: totalTasks || 0,
        tasks_due_today: tasksDueToday || 0,
        recent_contacts: recentContacts || [],
        upcoming_tasks: upcomingTasks || [],
      });
    }

    const totalContacts = db.prepare('SELECT COUNT(*) as c FROM contacts').get().c;
    const totalTasks = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
    const tasksDueToday = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE date(due_date) = date('now')").get().c;
    const recentContacts = db.prepare('SELECT id, first_name, last_name, company FROM contacts ORDER BY created_at DESC LIMIT 5').all();
    const upcomingTasks = db.prepare("SELECT id, title, status, due_date FROM tasks WHERE due_date >= datetime('now') ORDER BY due_date ASC LIMIT 5").all();

    return res.json({
      total_contacts: totalContacts,
      total_tasks: totalTasks,
      tasks_due_today: tasksDueToday,
      recent_contacts: recentContacts,
      upcoming_tasks: upcomingTasks,
    });
  } catch (e: any) {
    console.error('Dashboard error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}