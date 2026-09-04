import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  try {
    if (req.method === 'GET') {
      if (isSupabase()) {
        const { data, error } = await db.from('tasks')
          .select('id, title, status, priority, due_date, contact_id, created_at, contacts(first_name, last_name)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped = (data || []).map((t: any) => ({
          id: t.id, title: t.title, status: t.status, priority: t.priority,
          due_date: t.due_date, contact_id: t.contact_id, created_at: t.created_at,
          contact_name: t.contacts ? `${t.contacts.first_name} ${t.contacts.last_name}` : null,
        }));
        return res.json(mapped);
      }
      const rows = db.prepare(`
        SELECT t.id, t.title, t.status, t.priority, t.due_date, t.contact_id, t.created_at,
          c.first_name || ' ' || c.last_name as contact_name
        FROM tasks t LEFT JOIN contacts c ON t.contact_id = c.id
        ORDER BY t.created_at DESC
      `).all();
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { title, description, status, priority, due_date, contact_id } = req.body;
      if (!title) return res.status(400).json({ error: 'title required' });

      if (isSupabase()) {
        const { data, error } = await db.from('tasks')
          .insert({
            title, description: description || null,
            status: status || 'pending', priority: priority || 'medium',
            due_date: due_date || null, contact_id: contact_id || null,
            slug: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
          })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json(data);
      }

      const result = db.prepare('INSERT INTO tasks (title, description, status, priority, due_date, contact_id) VALUES (?, ?, ?, ?, ?, ?)')
        .run(title, description || null, status || 'pending', priority || 'medium', due_date || null, contact_id || null);
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(task);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('Tasks error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}