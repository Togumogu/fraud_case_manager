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
  const { domain, page, limit, user_name, action_type, search, date_from, date_to } = req.query;

  const conditions = ['1=1'];
  const params = [];

  if (domain) { conditions.push('c.domain_id = ?'); params.push(domain); }
  if (user_name) { conditions.push('ch.user_name = ?'); params.push(user_name); }
  if (action_type) { conditions.push('ch.action_type = ?'); params.push(action_type); }
  if (date_from) { conditions.push('ch.created_at >= ?'); params.push(date_from); }
  if (date_to) { conditions.push('ch.created_at <= ?'); params.push(date_to); }
  if (search) { conditions.push("(c.name LIKE ? OR CAST(ch.case_id AS TEXT) LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }

  const where = conditions.join(' AND ');
  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * pageSize;

  const total = db.prepare(`SELECT COUNT(*) as cnt FROM case_history ch JOIN cases c ON c.id = ch.case_id WHERE ${where}`).get(...params).cnt;
  const rows = db.prepare(`
    SELECT ch.*, c.name as case_name
    FROM case_history ch
    JOIN cases c ON c.id = ch.case_id
    WHERE ${where}
    ORDER BY ch.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, offset);

  res.json({ data: rows, total, page: pageNum, limit: pageSize });
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
