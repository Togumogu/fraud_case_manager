const express = require('express');
const router = express.Router({ mergeParams: true });
const { getDb } = require('../db/connection');

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT cr.*, c.name as related_case_name, c.status as related_case_status, c.severity as related_case_severity
    FROM case_relations cr
    JOIN cases c ON c.id = cr.related_case_id
    WHERE cr.case_id = ?
  `).all(req.params.id);
  res.json(rows);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { related_case_id, relation_type = 'sibling', created_by } = req.body;
  if (!related_case_id) return res.status(400).json({ error: 'related_case_id required' });
  try {
    db.prepare(`INSERT INTO case_relations (case_id, related_case_id, relation_type, created_by) VALUES (?, ?, ?, ?)`).run(req.params.id, related_case_id, relation_type, created_by || 'System');
    // Bidirectional
    db.prepare(`INSERT OR IGNORE INTO case_relations (case_id, related_case_id, relation_type, created_by) VALUES (?, ?, ?, ?)`).run(related_case_id, req.params.id, relation_type, created_by || 'System');
    res.status(201).json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:relatedId', (req, res) => {
  const db = getDb();
  db.prepare(`DELETE FROM case_relations WHERE case_id = ? AND related_case_id = ?`).run(req.params.id, req.params.relatedId);
  db.prepare(`DELETE FROM case_relations WHERE case_id = ? AND related_case_id = ?`).run(req.params.relatedId, req.params.id);
  res.json({ success: true });
});

module.exports = router;
