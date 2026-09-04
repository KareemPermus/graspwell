import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const db = getDb();

  try {
    if (req.method === 'GET') {
      if (isSupabase()) {
        const { data, error } = await db.from('tasks')
          .select('*, contacts(first_name, last_name)')
          .eq('id', id)
          .single();
        if (error || !data) return res.status(404).json({ error: 'Not found' });
        return res.json({
          ...data,
          contact_name: data.contacts ? `${data.contacts.first_name} ${data.contacts.last_name}` : null,
          contacts: undefined,
        });
      }
      const task = db.prepare(`
        SELECT t.*, c.first_name || ' ' || c.last_name as contact_name
        FROM tasks t LEFT JOIN contacts c ON t.contact_id = c.id WHERE t.id = ?
      `).get(id);
      if (!task) return res.status(404).json({ error: 'Not found' });
      return res.json(task);
    }

    if (req.method === 'PUT') {
      const { title, description, status, priority, due_date, contact_id } = req.body;
      if (isSupabase()) {
        const { data, error } = await db.from('tasks')
          .update({ title, description, status, priority, due_date, contact_id, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (error || !data) return res.status(404).json({ error: 'Not found' });
        return res.json(data);
      }
      db.prepare("UPDATE tasks SET title=?, description=?, status=?, priority=?, due_date=?, contact_id=?, updated_at=datetime('now') WHERE id=?")
        .run(title, description || null, status, priority, due_date || null, contact_id || null, id);
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!task) return res.status(404).json({ error: 'Not found' });
      return res.json(task);
    }

    if (req.method === 'DELETE') {
      if (isSupabase()) {
        await db.from('tasks').delete().eq('id', id);
        return res.json({ success: true });
      }
      db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('Task detail error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}