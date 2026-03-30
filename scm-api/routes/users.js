const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

router.get('/', (req, res) => {
  const db = getDb();
  const { domain } = req.query;
  const rows = domain
    ? db.prepare(`SELECT * FROM users WHERE domain_id = ? ORDER BY id`).all(domain)
    : db.prepare(`SELECT * FROM users ORDER BY id`).all();
  res.json(rows);
});

module.exports = router;
