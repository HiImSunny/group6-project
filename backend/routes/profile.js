// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// Xem thông tin cá nhân
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Trả về user từ DB (đầy đủ name, email, phone, avatarUrl, role, ...)
    return res.json({ message: "Access granted", user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }
});

// Cập nhật thông tin cá nhân
router.put('/', requireAuth, async (req, res) => {
  const { name, email, phone } = req.body;
  const fields = {};
  if (name  != null) fields.name  = name;
  if (email != null) fields.email = email; // (nếu cho phép đổi email, nhớ unique + re-verify)
  if (phone != null) fields.phone = phone;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fields },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Trả về cùng shape với GET cho nhất quán
    return res.json({ message: 'Updated', user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
