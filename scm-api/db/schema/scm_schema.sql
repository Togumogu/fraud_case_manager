CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  role_label TEXT,
  email TEXT UNIQUE,
  domain_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Open',
  severity TEXT DEFAULT 'medium',
  owner TEXT,
  create_user TEXT,
  create_date TEXT,
  update_user TEXT,
  update_date TEXT,
  total_amount REAL DEFAULT 0,
  bank_share REAL DEFAULT 0,
  customer_share REAL DEFAULT 0,
  currency TEXT DEFAULT 'TRY',
  domain_id TEXT DEFAULT 'payment',
  parent_case_id INTEGER,
  is_deleted INTEGER DEFAULT 0,
  close_reason TEXT,
  FOREIGN KEY (parent_case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  fdm_txn_id TEXT NOT NULL,
  linked_at TEXT DEFAULT (datetime('now')),
  linked_by TEXT,
  UNIQUE(case_id, fdm_txn_id),
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  from_review INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  file_path TEXT,
  uploaded_by TEXT,
  from_review INTEGER DEFAULT 0,
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  action_type TEXT,
  detail TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  reviewer_name TEXT,
  reviewer_email TEXT,
  review_type TEXT DEFAULT 'internal',
  status TEXT DEFAULT 'pending',
  comment TEXT,
  request_note TEXT,
  token TEXT,
  requested_by TEXT,
  requested_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_relations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  related_case_id INTEGER NOT NULL,
  relation_type TEXT DEFAULT 'sibling',
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(case_id, related_case_id),
  FOREIGN KEY (case_id) REFERENCES cases(id),
  FOREIGN KEY (related_case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS approval_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  case_id INTEGER,
  case_name TEXT,
  requested_by TEXT,
  requested_at TEXT DEFAULT (datetime('now')),
  reason TEXT,
  status TEXT DEFAULT 'pending',
  approved_by TEXT,
  approved_at TEXT,
  severity TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS domain_settings (
  domain_id TEXT PRIMARY KEY,
  maker_checker_enabled INTEGER DEFAULT 1,
  notification_enabled INTEGER DEFAULT 1,
  default_currency TEXT DEFAULT 'original',
  close_reasons TEXT DEFAULT '[]',
  reviewer_link_expiry_hours INTEGER DEFAULT 72,
  reviewer_inactivity_timeout_min INTEGER DEFAULT 30,
  reviewer_otp_enabled INTEGER DEFAULT 1,
  case_delete_enabled INTEGER DEFAULT 1,
  reopen_enabled INTEGER DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now')),
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS settings_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT,
  domain TEXT,
  setting TEXT,
  old_value TEXT,
  new_value TEXT,
  ip TEXT DEFAULT '10.0.1.45',
  timestamp TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT DEFAULT '🔍',
  color TEXT DEFAULT '#64748B',
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  created_by TEXT
);
