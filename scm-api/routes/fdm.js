const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

// GET /api/fdm/transactions
router.get('/transactions', (req, res) => {
  const db = getDb();
  const { domain, severity, mark_status, customer_no, date_from, date_to, min_amount, max_amount, page = 1, limit = 50, search, entity_type, entity_key, score_min, score_max } = req.query;

  let where = [];
  let params = [];

  if (domain) { where.push("source = ?"); params.push(domain); }
  if (severity) { where.push("severity = ?"); params.push(severity); }
  if (mark_status) { where.push("mark_status = ?"); params.push(mark_status); }
  if (customer_no) { where.push("customer_no LIKE ?"); params.push(`%${customer_no}%`); }
  if (entity_type) { where.push("entity_type = ?"); params.push(entity_type); }
  if (entity_key) { where.push("entity_key LIKE ?"); params.push(`%${entity_key}%`); }
  if (score_min) { where.push("score >= ?"); params.push(Number(score_min)); }
  if (score_max) { where.push("score <= ?"); params.push(Number(score_max)); }
  if (min_amount) { where.push("amount >= ?"); params.push(Number(min_amount)); }
  if (max_amount) { where.push("amount <= ?"); params.push(Number(max_amount)); }
  if (date_from) {
    const d = date_from.replace(/-/g, '');
    where.push("SUBSTR(create_date,7,4)||SUBSTR(create_date,4,2)||SUBSTR(create_date,1,2) >= ?");
    params.push(d);
  }
  if (date_to) {
    const d = date_to.replace(/-/g, '');
    where.push("SUBSTR(create_date,7,4)||SUBSTR(create_date,4,2)||SUBSTR(create_date,1,2) <= ?");
    params.push(d);
  }
  if (search) {
    where.push("(customer_name LIKE ? OR customer_no LIKE ? OR id LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  const total = db.prepare(`SELECT COUNT(*) as cnt FROM fdm.fdm_transactions ${whereStr}`).get(...params).cnt;
  const rows = db.prepare(`SELECT * FROM fdm.fdm_transactions ${whereStr} ORDER BY create_date DESC LIMIT ? OFFSET ?`).all(...params, Number(limit), offset);

  res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
});

// GET /api/fdm/transactions/:id
router.get('/transactions/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM fdm.fdm_transactions WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Transaction not found' });
  res.json(row);
});

// GET /api/fdm/entities
router.get('/entities', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM fdm.fdm_entities ORDER BY entity_type, entity_key`).all();
  res.json(rows);
});

// GET /api/fdm/domains
router.get('/domains', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM fdm.fdm_fraud_domains`).all();
  res.json(rows);
});

// GET /api/fdm/rules
router.get('/rules', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM fdm.fdm_fraud_rules ORDER BY id`).all();
  res.json(rows);
});

module.exports = router;
