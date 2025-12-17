// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();

/* ===== CORS (Vercel ↔ Render) ===== */
const corsOptions = {
  origin: [
    'https://group6-project-delta.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],
  exposedHeaders: [
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset',
    'Retry-After'
  ]
};

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* ===== Body / Cookie ===== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===== MongoDB ===== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Mongo connected'))
  .catch(err => {
    console.error('❌ Mongo error:', err.message);
    process.exit(1);
  });

/* ===== Routes ===== */
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/authAdvanced'));
app.use('/profile', require('./routes/profile'));
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/adminLogs'));

/* ===== Global Error ===== */
app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err);
  res.status(500).json({
    message: 'Server error',
    detail: err.message
  });
});

/* ===== Start Server ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
