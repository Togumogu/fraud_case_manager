const express = require('express');
const router = express.Router({ mergeParams: true });
const { getDb } = require('../db/connection');

// GET /api/cases/:id/transactions -- list FDM txns linked to case
router.get('/', (req, res) => {
  const db = getDb();
  const links = db.prepare(`SELECT fdm_txn_id FROM case_transactions WHERE case_id = ?`).all(req.params.id);
  const ids = links.map(l => l.fdm_txn_id);
  if (ids.length === 0) return res.json([]);
  const placeholders = ids.map(() => '?').join(',');
  const txns = db.prepare(`SELECT * FROM fdm.fdm_transactions WHERE id IN (${placeholders})`).all(...ids);
  res.json(txns);
});

// POST /api/cases/:id/transactions -- link transaction
router.post('/', (req, res) => {
  const db = getDb();
  const { fdm_txn_id, linked_by } = req.body;
  if (!fdm_txn_id) return res.status(400).json({ error: 'fdm_txn_id required' });
  db.prepare(`INSERT OR IGNORE INTO case_transactions (case_id, fdm_txn_id, linked_by) VALUES (?, ?, ?)`).run(req.params.id, fdm_txn_id, linked_by || 'System');
  res.status(201).json({ success: true });
});

// DELETE /api/cases/:id/transactions/:txnId
router.delete('/:txnId', (req, res) => {
  const db = getDb();
  db.prepare(`DELETE FROM case_transactions WHERE case_id = ? AND fdm_txn_id = ?`).run(req.params.id, req.params.txnId);
  res.json({ success: true });
});

module.exports = router;
