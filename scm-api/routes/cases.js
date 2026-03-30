const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

// GET /api/cases
router.get('/', (req, res) => {
  const db = getDb();
  const { status, severity, domain, owner, view, search, page = 1, limit = 100 } = req.query;

  let where = [];
  let params = [];

  if (view === 'deleted') {
    where.push("is_deleted = 1");
  } else {
    where.push("is_deleted = 0");
  }

  if (view === 'my_cases' && owner) {
    where.push("owner = ?"); params.push(owner);
  }

  if (status) { where.push("status = ?"); params.push(status); }
  if (severity) { where.push("severity = ?"); params.push(severity); }
  if (domain) { where.push("domain_id = ?"); params.push(domain); }
  if (search) {
    where.push("(name LIKE ? OR CAST(id AS TEXT) LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  const total = db.prepare(`SELECT COUNT(*) as cnt FROM cases ${whereStr}`).get(...params).cnt;
  const rows = db.prepare(`SELECT * FROM cases ${whereStr} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, Number(limit), offset);

  // Attach transaction IDs
  const getTxns = db.prepare(`SELECT fdm_txn_id FROM case_transactions WHERE case_id = ?`);
  const enriched = rows.map(c => ({
    ...c,
    transactions: getTxns.all(c.id).map(r => r.fdm_txn_id),
  }));

  res.json({ data: enriched, total, page: Number(page), limit: Number(limit) });
});

// POST /api/cases
router.post('/', (req, res) => {
  const db = getDb();
  const { name, description, status = 'Open', severity = 'medium', owner, create_user, currency = 'TRY', domain_id = 'payment', total_amount = 0, transaction_ids = [] } = req.body;

  if (!name) return res.status(400).json({ error: 'name is required' });

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2,'0')}.${String(now.getMonth()+1).padStart(2,'0')}.${now.getFullYear()}`;

  const result = db.prepare(`
    INSERT INTO cases (name, description, status, severity, owner, create_user, create_date, update_user, update_date, total_amount, currency, domain_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, description, status, severity, owner || null, create_user || 'System', dateStr, create_user || 'System', dateStr, total_amount, currency, domain_id);

  const caseId = result.lastInsertRowid;

  // Link transactions
  if (transaction_ids.length > 0) {
    const insertTxn = db.prepare(`INSERT OR IGNORE INTO case_transactions (case_id, fdm_txn_id, linked_by) VALUES (?, ?, ?)`);
    const insertMany = db.transaction((ids) => {
      for (const id of ids) insertTxn.run(caseId, id, create_user || 'System');
    });
    insertMany(transaction_ids);
  }

  // History entry
  db.prepare(`INSERT INTO case_history (case_id, user_name, action, action_type) VALUES (?, ?, ?, ?)`).run(caseId, create_user || 'System', 'Vaka oluşturuldu', 'create');

  const newCase = db.prepare(`SELECT * FROM cases WHERE id = ?`).get(caseId);
  res.status(201).json(newCase);
});

// GET /api/cases/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const c = db.prepare(`SELECT * FROM cases WHERE id = ?`).get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  const txns = db.prepare(`SELECT fdm_txn_id FROM case_transactions WHERE case_id = ?`).all(c.id).map(r => r.fdm_txn_id);
  res.json({ ...c, transactions: txns });
});

// PATCH /api/cases/:id
router.patch('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare(`SELECT * FROM cases WHERE id = ?`).get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Case not found' });

  const allowed = ['name', 'description', 'status', 'severity', 'owner', 'update_user', 'update_date', 'total_amount', 'bank_share', 'customer_share', 'currency', 'domain_id', 'close_reason'];
  const updates = [];
  const vals = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = ?`);
      vals.push(req.body[key]);
    }
  }
  if (updates.length === 0) return res.json(existing);

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2,'0')}.${String(now.getMonth()+1).padStart(2,'0')}.${now.getFullYear()}`;
  if (!req.body.update_date) {
    updates.push(`update_date = ?`);
    vals.push(dateStr);
  }

  vals.push(req.params.id);
  db.prepare(`UPDATE cases SET ${updates.join(', ')} WHERE id = ?`).run(...vals);

  // History
  const action = req.body.status === 'Closed' ? 'Vaka kapatıldı' : req.body.owner ? 'Vaka atandı' : 'Vaka güncellendi';
  const actionType = req.body.status === 'Closed' ? 'close' : req.body.owner ? 'assign' : 'update';
  db.prepare(`INSERT INTO case_history (case_id, user_name, action, action_type) VALUES (?, ?, ?, ?)`).run(req.params.id, req.body.update_user || 'System', action, actionType);

  const updated = db.prepare(`SELECT * FROM cases WHERE id = ?`).get(req.params.id);
  res.json(updated);
});

// DELETE /api/cases/:id (soft delete)
router.delete('/:id', (req, res) => {
  const db = getDb();
  const { deleted_by } = req.body || {};
  db.prepare(`UPDATE cases SET is_deleted = 1, update_date = ? WHERE id = ?`).run(
    new Date().toISOString().slice(0, 10),
    req.params.id
  );
  db.prepare(`INSERT INTO case_history (case_id, user_name, action, action_type) VALUES (?, ?, ?, ?)`).run(req.params.id, deleted_by || 'System', 'Vaka silindi', 'delete');
  res.json({ success: true });
});

module.exports = router;
