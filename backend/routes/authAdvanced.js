const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const multer = require('multer');

const User = require('../models/User');
const auth = require('../middleware/auth');  // đã có từ các buổi trước
const { sendMail } = require('../lib/mailer');
const { createResetToken } = require('../lib/resetToken');
const cloudinary = require('../lib/cloudinary');

// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
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

    const origin = req.headers.origin || 'http://localhost:4000';
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
router.post('/reset-password', async (req, res) => {
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

const upload = multer({
  storage: multer.memoryStorage(),                 // nhớ dùng memoryStorage để có req.file.buffer
  limits: { fileSize: 5 * 1024 * 1024 }            // 5MB
});

// Bọc multer để thấy lỗi rõ
router.post('/upload-avatar', auth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'Upload error', detail: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    // 0) Kiểm config Cloudinary
    const {
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET
    } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return res.status(500).json({ message: 'Server error', detail: 'Cloudinary env missing' });
    }

    // 1) Kiểm JWT & file
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized', detail: 'Missing/invalid JWT' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded', detail: 'Expect field name "file"' });
    }
    console.log('Upload request:', {
      user: req.user.id,
      mimetype: req.file.mimetype,
      size: req.file.size,
      name: req.file.originalname
    });

    // 2) Validate mimetype
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only image files are allowed' });
    }

    // 3) Upload Cloudinary (ghi log lỗi nếu có)
    const streamUpload = (buffer) => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'group6/avatars',
          transformation: [{ width: 512, height: 512, crop: 'limit' }]
        },
        (err, result) => {
          if (err) {
            console.error('Cloudinary error:', err);
            return reject(err);
          }
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    const result = await streamUpload(req.file.buffer);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatarUrl: result.secure_url } },
      { new: true }
    ).select('-password');

    return res.json({ msg: 'Avatar uploaded', url: result.secure_url, user });
  } catch (e) {
    console.error('Upload avatar server error:', e);
    return res.status(500).json({ message: 'Server error', detail: e.message });
  }
});

module.exports = router;
