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
