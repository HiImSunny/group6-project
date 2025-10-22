const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// POST /signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Thiếu name/email/password' });
    }

    // kiểm tra tồn tại nhanh
    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(409).json({ message: 'Email đã tồn tại' });

    const user = await User.create({ name, email, password });
    return res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    // trùng khóa unique
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }
    console.error('POST /signup error:', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Thiếu email/password' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });
    }

    const jti = uuidv4();
    const token = jwt.sign({ id: user._id, role: user.role, jti }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    console.error('POST /login error:', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

const express = require('express');
const blacklist = require('../lib/inMemoryBlacklist');

router.post('/logout', (req, res) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;

  if (!token) return res.status(200).json({ message: 'Logged out (no token provided)' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Đưa jti của "token hiện tại" vào blacklist cho đến khi exp
    blacklist.add(decoded.jti, decoded.exp);
    return res.json({ message: 'Logged out (current token revoked)' });
  } catch {
    // token hỏng/hết hạn coi như đã logout
    return res.status(200).json({ message: 'Logged out (invalid/expired token)' });
  }
});

module.exports = router;
