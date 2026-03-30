const express = require('express');
const router = express.Router({ mergeParams: true });
const { getDb } = require('../db/connection');

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM case_comments WHERE case_id = ? ORDER BY created_at ASC`).all(req.params.id);
  res.json(rows);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { user_name, content, from_review } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });
  const result = db.prepare(`INSERT INTO case_comments (case_id, user_name, content, from_review) VALUES (?, ?, ?, ?)`).run(req.params.id, user_name || 'System', content, from_review ? 1 : 0);
  db.prepare(`INSERT INTO case_history (case_id, user_name, action, action_type) VALUES (?, ?, ?, ?)`).run(req.params.id, user_name || 'System', from_review ? 'İnceleme yorumu eklendi' : 'Yorum eklendi', 'comment');
  const row = db.prepare(`SELECT * FROM case_comments WHERE id = ?`).get(result.lastInsertRowid);
  res.status(201).json(row);
});

module.exports = router;
