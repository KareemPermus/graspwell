import path from 'path';

let db: any = null;

export function getDb() {
  if (db) return db;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = require('@supabase/supabase-js');
    db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return db;
  }

  const Database = require('better-sqlite3');
  db = new Database(path.join('/tmp', 'app.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date TEXT,
      contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM contacts').get();
  if (count.c === 0) {
    db.exec(`
      INSERT INTO contacts (first_name, last_name, email, phone, company, notes) VALUES
        ('Jane', 'Doe', 'jane@acme.com', '555-0101', 'Acme Corp', 'Key decision maker'),
        ('John', 'Smith', 'john@globex.com', '555-0102', 'Globex Inc', 'Referred by Jane'),
        ('Alice', 'Wong', 'alice@initech.com', '555-0103', 'Initech', 'Met at conference');
      INSERT INTO tasks (title, description, status, priority, due_date, contact_id) VALUES
        ('Follow up with Jane', 'Discuss Q3 proposal', 'pending', 'high', datetime('now', '+1 day'), 1),
        ('Send proposal to John', 'Include pricing details', 'in_progress', 'medium', datetime('now', '+3 days'), 2),
        ('Review Initech contract', NULL, 'pending', 'low', datetime('now', '+7 days'), 3);
      INSERT INTO activities (contact_id, task_id, type, description) VALUES
        (1, NULL, 'call', 'Discussed project timeline'),
        (2, 2, 'email', 'Sent initial proposal draft'),
        (3, NULL, 'meeting', 'Onsite meeting at Initech HQ');
    `);
  }

  return db;
}

// Helper to detect if we're using Supabase
export function isSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}