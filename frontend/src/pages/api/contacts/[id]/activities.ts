import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const db = getDb();

  try {
    if (req.method === 'GET') {
      if (isSupabase()) {
        const { data, error } = await db.from('activities')
          .select('id, type, description, task_id, created_at')
          .eq('contact_id', id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.json(data);
      }
      const rows = db.prepare('SELECT id, type, description, task_id, created_at FROM activities WHERE contact_id = ? ORDER BY created_at DESC').all(id);
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { type, description, task_id } = req.body;
      if (!type || !description) return res.status(400).json({ error: 'type and description required' });

      if (isSupabase()) {
        const { data, error } = await db.from('activities')
          .insert({ contact_id: id, type, description, task_id: task_id || null, slug: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json(data);
      }

      const result = db.prepare('INSERT INTO activities (contact_id, type, description, task_id) VALUES (?, ?, ?, ?)')
        .run(id, type, description, task_id || null);
      const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(activity);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('Activities error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}