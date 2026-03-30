CREATE TABLE IF NOT EXISTS fdm_fraud_domains (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT,
  color TEXT
);

CREATE TABLE IF NOT EXISTS fdm_fraud_rules (
  id TEXT PRIMARY KEY,
  domain_id TEXT,
  description TEXT,
  threshold REAL,
  FOREIGN KEY (domain_id) REFERENCES fdm_fraud_domains(id)
);

CREATE TABLE IF NOT EXISTS fdm_transactions (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_label TEXT,
  source_color TEXT,
  entity_type TEXT,
  entity_key TEXT,
  severity TEXT,
  score INTEGER,
  trigger_rule TEXT,
  mark_status TEXT DEFAULT 'Marked',
  create_date TEXT,
  case_id TEXT,
  amount REAL,
  currency TEXT DEFAULT 'TRY',
  customer_name TEXT,
  customer_no TEXT
);

CREATE TABLE IF NOT EXISTS fdm_entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  customer_name TEXT,
  customer_no TEXT,
  UNIQUE(entity_type, entity_key)
);
