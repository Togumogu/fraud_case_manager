const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const path = require('path');
const { getDb } = require('../db/connection');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM case_attachments WHERE case_id = ? ORDER BY uploaded_at DESC`).all(req.params.id);
  res.json(rows);
});

router.post('/', upload.single('file'), (req, res) => {
  const db = getDb();
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { uploaded_by } = req.body;
  const result = db.prepare(`
    INSERT INTO case_attachments (case_id, file_name, file_size, file_type, file_path, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.params.id, req.file.originalname, req.file.size, req.file.mimetype, req.file.path, uploaded_by || 'System');
  db.prepare(`INSERT INTO case_history (case_id, user_name, action, action_type) VALUES (?, ?, ?, ?)`).run(req.params.id, uploaded_by || 'System', 'Dosya yüklendi', 'upload');
  const row = db.prepare(`SELECT * FROM case_attachments WHERE id = ?`).get(result.lastInsertRowid);
  res.status(201).json(row);
});

module.exports = router;
