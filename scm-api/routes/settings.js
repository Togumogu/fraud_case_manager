const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

router.get('/domains/:domainId', (req, res) => {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM domain_settings WHERE domain_id = ?`).get(req.params.domainId);
  if (!row) return res.status(404).json({ error: 'Domain settings not found' });
  row.close_reasons = JSON.parse(row.close_reasons || '[]');
  res.json(row);
});

router.patch('/domains/:domainId', (req, res) => {
  const db = getDb();
  const existing = db.prepare(`SELECT * FROM domain_settings WHERE domain_id = ?`).get(req.params.domainId);
  if (!existing) return res.status(404).json({ error: 'Domain settings not found' });

  const { updated_by, ...changes } = req.body;
  const allowed = ['maker_checker_enabled', 'notification_enabled', 'default_currency', 'close_reasons', 'reviewer_link_expiry_hours', 'reviewer_inactivity_timeout_min', 'reviewer_otp_enabled', 'case_delete_enabled'];

  for (const key of allowed) {
    if (changes[key] !== undefined) {
      const oldVal = String(existing[key]);
      const newVal = key === 'close_reasons' ? JSON.stringify(changes[key]) : String(changes[key]);
      db.prepare(`UPDATE domain_settings SET ${key} = ?, updated_at = datetime('now'), updated_by = ? WHERE domain_id = ?`).run(newVal, updated_by || 'System', req.params.domainId);
      db.prepare(`INSERT INTO settings_audit_log (user_name, domain, setting, old_value, new_value) VALUES (?, ?, ?, ?, ?)`).run(updated_by || 'System', req.params.domainId, key, oldVal, newVal);
    }
  }

  const updated = db.prepare(`SELECT * FROM domain_settings WHERE domain_id = ?`).get(req.params.domainId);
  updated.close_reasons = JSON.parse(updated.close_reasons || '[]');
  res.json(updated);
});

router.get('/audit-log', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM settings_audit_log ORDER BY timestamp DESC LIMIT 100`).all();
  res.json(rows);
});

module.exports = router;
