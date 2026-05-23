require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/character');
const gameRoutes = require('./routes/game');
const evidenceRoutes = require('./routes/evidence');

const app = express();

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));

// ─── BODY PARSER ────────────────────────────────────────────────────────────
app.use(express.json());

// ─── HEALTH CHECK ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', game: 'Red Frontier' });
});

// ─── API ROUTES ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/evidence', evidenceRoutes);

// ─── STATIC (PRODUCTION) ────────────────────────────────────────────────────
const clientPublic = path.join(__dirname, '../public');
if (fs.existsSync(clientPublic)) {
  app.use(express.static(clientPublic));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientPublic, 'index.html'));
  });
} else {
  console.log('⚠️ Static public directory not found. Serving API only.');
}

// ─── MONGODB ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5003;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Red Frontier Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
