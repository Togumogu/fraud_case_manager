const express = require('express');
const path = require('path');
const fs = require('fs');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads dir exists
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Auto-seed database on first start (e.g. fresh Railway deploy)
const DB_DIR = process.env.DB_DIR || path.join(__dirname, 'db');
const scmDbPath = path.join(DB_DIR, 'scm.db');
if (!fs.existsSync(scmDbPath)) {
  console.log('Database not found, running seed...');
  const { initFdmSchema, initScmSchema } = require('./db/connection');
  initFdmSchema();
  initScmSchema();
  const { seedFdm } = require('./db/seed/fdm_seed');
  const { seedScm } = require('./db/seed/scm_seed');
  seedFdm();
  seedScm();
  console.log('Database seeded successfully.');
}

// Routes
app.use('/api/fdm', require('./routes/fdm'));
app.use('/api/cases/:id/transactions', require('./routes/transactions'));
app.use('/api/cases/:id/comments', require('./routes/comments'));
app.use('/api/cases/:id/attachments', require('./routes/attachments'));
app.use('/api/cases/:id/history', require('./routes/history'));
app.use('/api/cases/:id/reviews', require('./routes/reviews'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/cases/:id/relations', require('./routes/relations'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/users', require('./routes/users'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// API error handler (must be before the catch-all)
app.use(errorHandler);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'scm-app', 'dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`SCM API running on http://localhost:${PORT}`);
});
