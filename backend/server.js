// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();

app.use(cors({
    origin: [
    'https://group6-project-delta.vercel.app',  // domain frontend trên Vercel
    'http://localhost:3000'                     // cho phép cả local dev
  ],
  credentials: true,
  exposedHeaders: ['RateLimit-Limit','RateLimit-Remaining','RateLimit-Reset','Retry-After'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('trust proxy', 1);


// Kết nối Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Mongo connected'))
  .catch(err => {
    console.error('❌ Mongo error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/authAdvanced'));
app.use('/profile', require('./routes/profile'));
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/adminLogs'));

app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err);
  res.status(500).json({ message: 'Server error', detail: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend http://localhost:${PORT}`));
