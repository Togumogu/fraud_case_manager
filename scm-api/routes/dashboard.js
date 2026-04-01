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

const MONTH_LABELS = { '01':'Oca','02':'Şub','03':'Mar','04':'Nis','05':'May','06':'Haz','07':'Tem','08':'Ağu','09':'Eyl','10':'Eki','11':'Kas','12':'Ara' };

const FRAUD_DOMAINS = [
  { id: 'payment',          label: 'Payment Fraud',       color: '#0891B2' },
  { id: 'credit_card',      label: 'Credit Card Fraud',   color: '#8B5CF6' },
  { id: 'application',      label: 'Application Fraud',   color: '#F59E0B' },
  { id: 'account_takeover', label: 'Account Takeover',    color: '#EF4444' },
  { id: 'internal',         label: 'Internal Fraud',       color: '#6366F1' },
];

// Build a sorted array of YYYY-MM keys for the last N months
function lastNMonths(n) {
  const result = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    result.push(`${y}-${m}`);
  }
  return result;
}

router.get('/trends', (req, res) => {
  const db = getDb();
  const { domain } = req.query;
  const months = Math.min(24, Math.max(1, parseInt(req.query.months) || 6));
  const slots = lastNMonths(months);

  const domainFilter = domain ? ' AND domain_id = ?' : '';
  const dp = domain ? [domain] : [];

  const createdRows = db.prepare(`
    SELECT SUBSTR(create_date,7,4)||'-'||SUBSTR(create_date,4,2) as ym, COUNT(*) as cnt
    FROM cases WHERE is_deleted = 0${domainFilter}
    GROUP BY ym
  `).all(...dp);

  const closedRows = db.prepare(`
    SELECT SUBSTR(create_date,7,4)||'-'||SUBSTR(create_date,4,2) as ym, COUNT(*) as cnt
    FROM cases WHERE is_deleted = 0 AND status = 'Closed'${domainFilter}
    GROUP BY ym
  `).all(...dp);

  const fdmSource = domain ? DOMAIN_TO_SOURCE[domain] : null;
  const txnFilter = fdmSource ? ' AND source = ?' : '';
  const tp = fdmSource ? [fdmSource] : [];
  const txnRows = db.prepare(`
    SELECT SUBSTR(create_date,7,4)||'-'||SUBSTR(create_date,4,2) as ym, COUNT(*) as cnt
    FROM fdm.fdm_transactions WHERE 1=1${txnFilter}
    GROUP BY ym
  `).all(...tp);

  const toMap = rows => Object.fromEntries(rows.map(r => [r.ym, r.cnt]));
  const createdMap = toMap(createdRows);
  const closedMap = toMap(closedRows);
  const txnMap = toMap(txnRows);

  res.json({
    months: slots.map(s => MONTH_LABELS[s.slice(5)] + ' ' + s.slice(0, 4)),
    created: slots.map(s => createdMap[s] || 0),
    closed: slots.map(s => closedMap[s] || 0),
    transactions: slots.map(s => txnMap[s] || 0),
  });
});

router.get('/severity-distribution', (req, res) => {
  const db = getDb();
  const { domain } = req.query;
  const domainFilter = domain ? ' AND domain_id = ?' : '';
  const dp = domain ? [domain] : [];

  const caseRows = db.prepare(`
    SELECT severity, COUNT(*) as cnt FROM cases
    WHERE is_deleted = 0 AND status = 'Open'${domainFilter}
    GROUP BY severity
  `).all(...dp);

  const fdmSource = domain ? DOMAIN_TO_SOURCE[domain] : null;
  const txnFilter = fdmSource ? ' AND source = ?' : '';
  const tp = fdmSource ? [fdmSource] : [];
  const txnRows = db.prepare(`
    SELECT severity, COUNT(*) as cnt FROM fdm.fdm_transactions
    WHERE 1=1${txnFilter}
    GROUP BY severity
  `).all(...tp);

  const cases = { critical: 0, high: 0, medium: 0, low: 0 };
  caseRows.forEach(r => { if (cases[r.severity] !== undefined) cases[r.severity] = r.cnt; });

  const transactions = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  txnRows.forEach(r => { if (transactions[r.severity] !== undefined) transactions[r.severity] = r.cnt; });

  res.json({ cases, transactions });
});

router.get('/domain-heatmap', (req, res) => {
  const db = getDb();

  const caseRows = db.prepare(`
    SELECT
      domain_id,
      COUNT(*) as totalCases,
      SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as openCases,
      SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closedCases,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as criticalCount,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as highCount,
      ROUND(SUM(total_amount), 2) as totalAmount
    FROM cases WHERE is_deleted = 0
    GROUP BY domain_id
  `).all();

  const txnRows = db.prepare(`
    SELECT source, COUNT(*) as txnCount, ROUND(AVG(score), 1) as avgScore
    FROM fdm.fdm_transactions
    GROUP BY source
  `).all();

  const SOURCE_TO_DOMAIN = Object.fromEntries(Object.entries(DOMAIN_TO_SOURCE).map(([k, v]) => [v, k]));
  const txnMap = Object.fromEntries(txnRows.map(r => [SOURCE_TO_DOMAIN[r.source] || r.source, r]));
  const caseMap = Object.fromEntries(caseRows.map(r => [r.domain_id, r]));

  const result = FRAUD_DOMAINS.map(d => {
    const c = caseMap[d.id] || { totalCases: 0, openCases: 0, closedCases: 0, criticalCount: 0, highCount: 0, totalAmount: 0 };
    const t = txnMap[d.id] || { txnCount: 0, avgScore: 0 };
    return { domain_id: d.id, label: d.label, color: d.color, ...c, txnCount: t.txnCount, avgScore: t.avgScore };
  });

  res.json(result);
});

module.exports = router;
