const express = require('express');
const router = express.Router({ mergeParams: true });
const { getDb } = require('../db/connection');

router.get('/', (req, res) => {
  const db = getDb();
  // Global reviews list (when mounted at /api/reviews)
  if (!req.params.id) {
    const { reviewer_name, status } = req.query;
    let sql = `SELECT cr.*, c.name as case_name, c.status as case_status, c.severity FROM case_reviews cr LEFT JOIN cases c ON cr.case_id = c.id WHERE 1=1`;
    const params = [];
    if (reviewer_name) { sql += ` AND cr.reviewer_name = ?`; params.push(reviewer_name); }
    if (status) { sql += ` AND cr.status = ?`; params.push(status); }
    sql += ` ORDER BY cr.requested_at DESC`;
    const rows = db.prepare(sql).all(...params);
    return res.json(rows);
  }
  const rows = db.prepare(`SELECT * FROM case_reviews WHERE case_id = ? ORDER BY requested_at DESC`).all(req.params.id);
  res.json(rows);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { reviewer_name, reviewer_email, review_type = 'internal', requested_by, request_note } = req.body;
  const result = db.prepare(`
    INSERT INTO case_reviews (case_id, reviewer_name, reviewer_email, review_type, status, requested_by, request_note)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)
  `).run(req.params.id, reviewer_name, reviewer_email, review_type, requested_by || 'System', request_note || null);
  db.prepare(`INSERT INTO case_history (case_id, user_name, action, action_type) VALUES (?, ?, ?, ?)`).run(req.params.id, requested_by || 'System', 'Review talep edildi', 'review');
  const row = db.prepare(`SELECT * FROM case_reviews WHERE id = ?`).get(result.lastInsertRowid);
  res.status(201).json(row);
});

router.patch('/:reviewId', (req, res) => {
  const db = getDb();
  const { status, comment } = req.body;
  const completedAt = status === 'completed' ? new Date().toISOString() : null;
  db.prepare(`UPDATE case_reviews SET status = ?, comment = ?, completed_at = ? WHERE id = ? AND case_id = ?`).run(status, comment, completedAt, req.params.reviewId, req.params.id);
  const row = db.prepare(`SELECT * FROM case_reviews WHERE id = ?`).get(req.params.reviewId);
  res.json(row);
});

module.exports = router;
