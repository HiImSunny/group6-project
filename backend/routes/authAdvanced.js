// backend/routes/authAdvanced.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendMail } = require('../lib/mailer');
const { createResetToken } = require('../lib/resetToken');
const cloudinary = require('../lib/cloudinary');
const { forgotPwLimiter } = require('../middleware/rateLimiters');
const { logActivity } = require('../middleware/logActivity');

// POST /forgot-password
router.post('/auth/forgot-password', forgotPwLimiter, logActivity('FORGOT_PW', (req)=>({ email: req.body?.email })), async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    const user = await User.findOne({ email });
    // tránh lộ thông tin: vẫn trả OK kể cả không tìm thấy
    if (!user) return res.json({ msg: 'If email exists, a reset link has been sent' });

    const { token, hash } = createResetToken();
    user.resetPasswordTokenHash = hash;
    user.resetPasswordExpires   = new Date(Date.now() + 15*60*1000); // 15 phút
    await user.save();

    const origin = process.env.FRONTEND_URL || 'http://localhost:4000';
    const resetUrl = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;


    await sendMail({
      to: email,
      subject: 'Password Reset',
      html: `
        <p>Chào ${user.name || 'bạn'},</p>
        <p>Link đổi mật khẩu (15 phút):</p>
        <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
        <p>Nếu không phải bạn, hãy bỏ qua email này.</p>
      `
    });

    res.json({ msg: 'Reset token sent to email (if exists)' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /reset-password
router.post('/auth/reset-password',
  logActivity('RESET_PW', (req)=>({ email: req.body?.email })), async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || !token || !newPassword) {
      return res.status(400).json({ msg: 'email, token, newPassword are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordTokenHash || !user.resetPasswordExpires) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (tokenHash !== user.resetPasswordTokenHash || Date.now() > user.resetPasswordExpires.getTime()) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires   = undefined;
    await user.save();

    res.json({ msg: 'Password has been reset successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

const { requireAuth } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /upload-avatar
router.post('/upload-avatar', logActivity('AVATAR_UPLOAD'),
  requireAuth,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) return res.status(400).json({ message: 'Upload error', detail: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded', detail: 'Expect field name "file"' });
      if (!/^image\/(png|jpe?g|webp)$/i.test(req.file.mimetype)) {
        return res.status(400).json({ message: 'Only PNG/JPG/WEBP allowed' });
      }

      // 1) Resize local trước khi đẩy Cloudinary
      const processed = await sharp(req.file.buffer)
        .rotate() // auto-orient
        .resize(512, 512, { fit: 'cover' })
        .toFormat('webp')
        .toBuffer();

      // 2) Upload stream lên Cloudinary
      const streamUpload = (buffer) => new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'group6/avatars', resource_type: 'image', format: 'webp' },
          (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(buffer);
      });
      const result = await streamUpload(processed);

      // 3) Cập nhật User, xoá ảnh cũ nếu có
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const oldPublicId = user.avatarPublicId;
      user.avatarUrl = result.secure_url;
      user.avatarPublicId = result.public_id;
      await user.save();

      if (oldPublicId && oldPublicId !== result.public_id) {
        cloudinary.uploader.destroy(oldPublicId).catch(() => {});
      }

      const safeUser = await User.findById(user._id).select('-password');
      return res.json({ msg: 'Avatar uploaded', url: result.secure_url, user: safeUser });
    } catch (e) {
      console.error('Upload avatar server error:', e);
      return res.status(500).json({ message: 'Server error', detail: e.message });
    }
  }
);

module.exports = router;
