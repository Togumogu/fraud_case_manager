const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

router.get('/', (req, res) => {
  const db = getDb();
  const { status = 'pending', case_id } = req.query;
  const rows = case_id
    ? db.prepare(`SELECT * FROM approval_requests WHERE status = ? AND case_id = ? ORDER BY requested_at DESC`).all(status, Number(case_id))
    : db.prepare(`SELECT * FROM approval_requests WHERE status = ? ORDER BY requested_at DESC`).all(status);
  res.json(rows);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { type, case_id, case_name, requested_by, reason, severity } = req.body;
  const result = db.prepare(`
    INSERT INTO approval_requests (type, case_id, case_name, requested_by, reason, severity)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(type, case_id, case_name, requested_by, reason, severity);
  const row = db.prepare(`SELECT * FROM approval_requests WHERE id = ?`).get(result.lastInsertRowid);
  res.status(201).json(row);
});

router.patch('/:id', (req, res) => {
  const db = getDb();
  const { status, approved_by } = req.body;
  db.prepare(`UPDATE approval_requests SET status = ?, approved_by = ?, approved_at = datetime('now') WHERE id = ?`).run(status, approved_by, req.params.id);
  const row = db.prepare(`SELECT * FROM approval_requests WHERE id = ?`).get(req.params.id);
  res.json(row);
});

module.exports = router;
