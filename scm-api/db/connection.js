const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = process.env.DB_DIR || path.join(__dirname);
const FDM_PATH = path.join(DB_DIR, 'fdm.db');
const SCM_PATH = path.join(DB_DIR, 'scm.db');

let _db = null;

function getDb() {
  if (_db) return _db;

  _db = new Database(SCM_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  // Attach FDM as a read-only schema alias
  _db.exec(`ATTACH DATABASE '${FDM_PATH.replace(/\\/g, '/')}' AS fdm`);

  // Migrations: add columns if they don't exist yet
  const cols = _db.prepare(`PRAGMA table_info(cases)`).all().map(c => c.name);
  if (!cols.includes('bank_share'))     _db.exec(`ALTER TABLE cases ADD COLUMN bank_share REAL DEFAULT 0`);
  if (!cols.includes('customer_share')) _db.exec(`ALTER TABLE cases ADD COLUMN customer_share REAL DEFAULT 0`);

  const settingsCols = _db.prepare(`PRAGMA table_info(domain_settings)`).all().map(c => c.name);
  if (!settingsCols.includes('reopen_enabled')) _db.exec(`ALTER TABLE domain_settings ADD COLUMN reopen_enabled INTEGER DEFAULT 1`);

  // Migration: create domains table if it doesn't exist
  _db.exec(`
    CREATE TABLE IF NOT EXISTS domains (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      icon TEXT DEFAULT '🔍',
      color TEXT DEFAULT '#64748B',
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      created_by TEXT
    )
  `);

  // Seed default domains if table is empty
  const domainCount = _db.prepare(`SELECT COUNT(*) as cnt FROM domains`).get().cnt;
  if (domainCount === 0) {
    const ins = _db.prepare(`INSERT OR IGNORE INTO domains (id, label, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)`);
    ins.run('payment',          'Payment Fraud',       '₺',  '#0891B2', 0);
    ins.run('credit_card',      'Credit Card Fraud',   '💳', '#8B5CF6', 1);
    ins.run('application',      'Application Fraud',   '📋', '#F59E0B', 2);
    ins.run('account_takeover', 'Account Takeover',    '🔓', '#EF4444', 3);
    ins.run('internal',         'Internal Fraud',      '🏢', '#6366F1', 4);
  }

  return _db;
}

function getFdmDb() {
  const db = new Database(FDM_PATH);
  db.pragma('journal_mode = WAL');
  return db;
}

function initScmSchema() {
  const db = new Database(SCM_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  const sql = fs.readFileSync(path.join(__dirname, 'schema', 'scm_schema.sql'), 'utf8');
  db.exec(sql);
  db.close();
}

function initFdmSchema() {
  const db = new Database(FDM_PATH);
  db.pragma('journal_mode = WAL');
  const sql = fs.readFileSync(path.join(__dirname, 'schema', 'fdm_schema.sql'), 'utf8');
  db.exec(sql);
  db.close();
}

module.exports = { getDb, getFdmDb, initScmSchema, initFdmSchema };
