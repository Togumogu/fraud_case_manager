const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

router.get('/', (req, res) => {
  const db = getDb();
  const { status = 'pending', case_id, domain } = req.query;

  if (case_id) {
    const rows = db.prepare(`SELECT * FROM approval_requests WHERE status = ? AND case_id = ? ORDER BY requested_at DESC`).all(status, Number(case_id));
    return res.json(rows);
  }

  if (domain) {
    const rows = db.prepare(`
      SELECT ar.* FROM approval_requests ar
      JOIN cases c ON c.id = ar.case_id
      WHERE ar.status = ? AND c.domain_id = ?
      ORDER BY ar.requested_at DESC
    `).all(status, domain);
    return res.json(rows);
  }

  const rows = db.prepare(`SELECT * FROM approval_requests WHERE status = ? ORDER BY requested_at DESC`).all(status);
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
