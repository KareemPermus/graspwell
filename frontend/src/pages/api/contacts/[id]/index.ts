import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const db = getDb();

  try {
    if (req.method === 'GET') {
      if (isSupabase()) {
        const { data, error } = await db.from('contacts').select('*').eq('id', id).single();
        if (error || !data) return res.status(404).json({ error: 'Not found' });
        return res.json(data);
      }
      const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
      if (!contact) return res.status(404).json({ error: 'Not found' });
      return res.json(contact);
    }

    if (req.method === 'PUT') {
      const { first_name, last_name, email, phone, company, notes } = req.body;
      if (isSupabase()) {
        const { data, error } = await db.from('contacts')
          .update({ first_name, last_name, email, phone, company, notes, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (error || !data) return res.status(404).json({ error: 'Not found' });
        return res.json(data);
      }
      db.prepare("UPDATE contacts SET first_name=?, last_name=?, email=?, phone=?, company=?, notes=?, updated_at=datetime('now') WHERE id=?")
        .run(first_name, last_name, email || null, phone || null, company || null, notes || null, id);
      const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
      if (!contact) return res.status(404).json({ error: 'Not found' });
      return res.json(contact);
    }

    if (req.method === 'DELETE') {
      if (isSupabase()) {
        await db.from('contacts').delete().eq('id', id);
        return res.json({ success: true });
      }
      db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('Contact detail error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}