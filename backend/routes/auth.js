const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    console.error('POST /login error:', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// POST /logout
router.post('/logout', (_req, res) => res.json({ message: 'Logged out' }));

module.exports = router;
