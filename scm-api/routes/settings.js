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
  const allowed = ['maker_checker_enabled', 'notification_enabled', 'default_currency', 'close_reasons', 'reviewer_link_expiry_hours', 'reviewer_inactivity_timeout_min', 'reviewer_otp_enabled', 'case_delete_enabled', 'reopen_enabled'];

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

// Domain list CRUD
router.get('/domain-list', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM domains WHERE is_active = 1 ORDER BY sort_order, created_at`).all();
  res.json(rows);
});

router.post('/domain-list', (req, res) => {
  const db = getDb();
  const { id, label, icon, color, created_by } = req.body;
  if (!id || !label) return res.status(400).json({ error: 'id ve label zorunludur' });
  if (!/^[a-z0-9_]+$/.test(id)) return res.status(400).json({ error: 'Domain ID yalnızca küçük harf, rakam ve alt çizgi içerebilir' });
  const existing = db.prepare(`SELECT id FROM domains WHERE id = ?`).get(id);
  if (existing) return res.status(409).json({ error: 'Bu ID ile bir domain zaten mevcut' });
  const maxOrder = db.prepare(`SELECT COALESCE(MAX(sort_order), -1) as m FROM domains`).get().m;
  db.prepare(`INSERT INTO domains (id, label, icon, color, sort_order, created_by) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, label, icon || '🔍', color || '#64748B', maxOrder + 1, created_by || 'System');
  // Also create default domain_settings for the new domain
  db.prepare(`INSERT OR IGNORE INTO domain_settings (domain_id, maker_checker_enabled, notification_enabled, default_currency, close_reasons, reviewer_link_expiry_hours, reviewer_inactivity_timeout_min, reviewer_otp_enabled, case_delete_enabled, reopen_enabled) VALUES (?, 1, 1, 'original', '["Soruşturma Tamamlandı","Çözüme Kavuşturuldu","Mükerrer"]', 72, 30, 1, 1, 1)`)
    .run(id);
  const row = db.prepare(`SELECT * FROM domains WHERE id = ?`).get(id);
  res.status(201).json(row);
});

router.delete('/domain-list/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const domain = db.prepare(`SELECT * FROM domains WHERE id = ?`).get(id);
  if (!domain) return res.status(404).json({ error: 'Domain bulunamadı' });
  const caseCount = db.prepare(`SELECT COUNT(*) as cnt FROM cases WHERE domain_id = ? AND is_deleted = 0`).get(id).cnt;
  if (caseCount > 0) return res.status(409).json({ error: `Bu domaine ait ${caseCount} aktif vaka var. Domain silinemez.` });
  db.prepare(`UPDATE domains SET is_active = 0 WHERE id = ?`).run(id);
  res.json({ success: true });
});

module.exports = router;
