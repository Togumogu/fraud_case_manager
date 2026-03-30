const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM users ORDER BY id`).all();
  res.json(rows);
});

module.exports = router;
