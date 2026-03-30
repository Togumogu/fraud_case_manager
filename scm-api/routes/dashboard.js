const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

router.get('/kpis', (req, res) => {
  const db = getDb();
  const totalCases = db.prepare(`SELECT COUNT(*) as cnt FROM cases WHERE is_deleted = 0`).get().cnt;
  const openCases = db.prepare(`SELECT COUNT(*) as cnt FROM cases WHERE is_deleted = 0 AND status = 'Open'`).get().cnt;
  const closedCases = db.prepare(`SELECT COUNT(*) as cnt FROM cases WHERE is_deleted = 0 AND status = 'Closed'`).get().cnt;
  const pendingReviews = db.prepare(`SELECT COUNT(*) as cnt FROM case_reviews WHERE status = 'pending'`).get().cnt;
  const pendingTransactions = db.prepare(`SELECT COUNT(*) as cnt FROM fdm.fdm_transactions WHERE mark_status = 'Marked'`).get().cnt;

  res.json({ totalCases, openCases, closedCases, myCases: 0, pendingTransactions, pendingReviews });
});

router.get('/activity', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT ch.*, c.name as case_name
    FROM case_history ch
    JOIN cases c ON c.id = ch.case_id
    ORDER BY ch.created_at DESC
    LIMIT 20
  `).all();
  res.json(rows);
});

router.get('/unassigned-cases', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, name, create_date as date, severity, domain_id as domain
    FROM cases
    WHERE is_deleted = 0 AND (owner IS NULL OR owner = '')
    ORDER BY id DESC
    LIMIT 20
  `).all();
  res.json(rows);
});

module.exports = router;
