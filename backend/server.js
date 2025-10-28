// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();

app.use(cors({ origin: 'http://localhost:4000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
app.use('/users', require('./routes/user'));

app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err);
  res.status(500).json({ message: 'Server error', detail: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend http://localhost:${PORT}`));
