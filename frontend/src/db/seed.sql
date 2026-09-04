INSERT INTO contacts (slug, first_name, last_name, email, phone, company, notes)
VALUES
  ('contact-jane-doe', 'Jane', 'Doe', 'jane@acme.com', '555-0101', 'Acme Corp', 'Key decision maker'),
  ('contact-john-smith', 'John', 'Smith', 'john@globex.com', '555-0102', 'Globex Inc', 'Referred by Jane'),
  ('contact-alice-wong', 'Alice', 'Wong', 'alice@initech.com', '555-0103', 'Initech', 'Met at conference')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tasks (slug, title, description, status, priority, due_date, contact_id)
VALUES
  ('task-follow-up-jane', 'Follow up with Jane', 'Discuss Q3 proposal', 'pending', 'high', now() + interval '1 day', (SELECT id FROM contacts WHERE slug='contact-jane-doe')),
  ('task-send-proposal', 'Send proposal to John', 'Include pricing details', 'in_progress', 'medium', now() + interval '3 days', (SELECT id FROM contacts WHERE slug='contact-john-smith')),
  ('task-review-contract', 'Review Initech contract', NULL, 'pending', 'low', now() + interval '7 days', (SELECT id FROM contacts WHERE slug='contact-alice-wong'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO activities (slug, contact_id, task_id, type, description)
VALUES
  ('activity-call-jane', (SELECT id FROM contacts WHERE slug='contact-jane-doe'), NULL, 'call', 'Discussed project timeline'),
  ('activity-email-john', (SELECT id FROM contacts WHERE slug='contact-john-smith'), (SELECT id FROM tasks WHERE slug='task-send-proposal'), 'email', 'Sent initial proposal draft'),
  ('activity-meeting-alice', (SELECT id FROM contacts WHERE slug='contact-alice-wong'), NULL, 'meeting', 'Onsite meeting at Initech HQ')
ON CONFLICT (slug) DO NOTHING;