const express = require('express');
const router = express.Router({ mergeParams: true });
const { getDb } = require('../db/connection');

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM case_history WHERE case_id = ? ORDER BY created_at DESC`).all(req.params.id);
  res.json(rows);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { user_name, action, action_type, detail } = req.body;
  if (!action) return res.status(400).json({ error: 'action required' });
  const result = db.prepare(`INSERT INTO case_history (case_id, user_name, action, action_type, detail) VALUES (?, ?, ?, ?, ?)`).run(
    req.params.id, user_name || 'System', action, action_type || 'review', detail || null
  );
  const row = db.prepare(`SELECT * FROM case_history WHERE id = ?`).get(result.lastInsertRowid);
  res.status(201).json(row);
});

module.exports = router;
