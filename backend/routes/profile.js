const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Xem thông tin cá nhân
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Cập nhật thông tin cá nhân
router.put('/', auth, async (req, res) => {
  const { name, email, phone } = req.body;
  const fields = {};
  if (name) fields.name = name;
  if (email) fields.email = email;
  if (phone) fields.phone = phone;

  try {
    let user = await User.findByIdAndUpdate(req.user.id, { $set: fields }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
