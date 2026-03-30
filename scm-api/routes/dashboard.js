const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

const DOMAIN_TO_SOURCE = {
  payment: "payment_fraud",
  credit_card: "cc_fraud",
  application: "app_fraud",
  account_takeover: "ato_fraud",
  internal: "int_fraud",
};

router.get('/kpis', (req, res) => {
  const db = getDb();
  const { domain } = req.query;
  const domainFilter = domain ? ' AND domain_id = ?' : '';
  const domainParams = domain ? [domain] : [];

  const totalCases = db.prepare(`SELECT COUNT(*) as cnt FROM cases WHERE is_deleted = 0${domainFilter}`).get(...domainParams).cnt;
  const openCases = db.prepare(`SELECT COUNT(*) as cnt FROM cases WHERE is_deleted = 0 AND status = 'Open'${domainFilter}`).get(...domainParams).cnt;
  const closedCases = db.prepare(`SELECT COUNT(*) as cnt FROM cases WHERE is_deleted = 0 AND status = 'Closed'${domainFilter}`).get(...domainParams).cnt;

  const reviewQuery = domain
    ? `SELECT COUNT(*) as cnt FROM case_reviews cr JOIN cases c ON c.id = cr.case_id WHERE cr.status = 'pending' AND c.domain_id = ?`
    : `SELECT COUNT(*) as cnt FROM case_reviews WHERE status = 'pending'`;
  const pendingReviews = db.prepare(reviewQuery).get(...domainParams).cnt;

  const fdmSource = domain ? DOMAIN_TO_SOURCE[domain] : null;
  const txnFilter = fdmSource ? ' AND source = ?' : '';
  const txnParams = fdmSource ? [fdmSource] : [];
  const pendingTransactions = db.prepare(`SELECT COUNT(*) as cnt FROM fdm.fdm_transactions WHERE mark_status = 'Marked'${txnFilter}`).get(...txnParams).cnt;

  res.json({ totalCases, openCases, closedCases, myCases: 0, pendingTransactions, pendingReviews });
});

router.get('/activity', (req, res) => {
  const db = getDb();
  const { domain } = req.query;
  const domainFilter = domain ? ' AND c.domain_id = ?' : '';
  const params = domain ? [domain] : [];
  const rows = db.prepare(`
    SELECT ch.*, c.name as case_name
    FROM case_history ch
    JOIN cases c ON c.id = ch.case_id
    WHERE 1=1${domainFilter}
    ORDER BY ch.created_at DESC
    LIMIT 20
  `).all(...params);
  res.json(rows);
});

router.get('/unassigned-cases', (req, res) => {
  const db = getDb();
  const { domain } = req.query;
  const domainFilter = domain ? ' AND domain_id = ?' : '';
  const params = domain ? [domain] : [];
  const rows = db.prepare(`
    SELECT id, name, create_date as date, severity, domain_id as domain
    FROM cases
    WHERE is_deleted = 0 AND (owner IS NULL OR owner = '')${domainFilter}
    ORDER BY id DESC
    LIMIT 20
  `).all(...params);
  res.json(rows);
});

module.exports = router;
