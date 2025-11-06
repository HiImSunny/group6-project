// backend/routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');
const ms = require('ms');
const { logActivity } = require('../middleware/logActivity');
const { loginLimiter } = require('../middleware/rateLimiters');

// ========== SIGNUP ==========
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = (req.body || {});
    if (!email || !password || !name)
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });

    const existed = await User.findOne({ email });
    if (existed)
      return res.status(400).json({ message: 'Email đã tồn tại' });

    // model có pre-save hook hash password
    const user = await User.create({ email, password, name, role: 'user' });

    const accessToken = signAccess({ id: user._id, role: user.role, email: user.email });
    const refreshToken = signRefresh({ id: user._id });

    const expiresAt = new Date(Date.now() + ms(process.env.REFRESH_EXPIRES || '7d'));
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      expiresAt,
    });

    return res.json({
      message: 'Đăng ký thành công',
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
});

// ========== LOGIN ==========
router.post(
  '/login',
  loginLimiter,
  logActivity('LOGIN', (req, res) => ({ email: req.body?.email, success: res.statusCode === 200 })),
  async (req, res) => {
    try {
      const { email, password } = (req.body || {});
      if (!email || !password) {
        return res.status(400).json({ msg: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }

      // Safe user
      const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      };

      // 🔁 cấp token bằng helper
      const accessToken = signAccess({ id: user._id, role: user.role, email: user.email });
      const refreshToken = signRefresh({ id: user._id });

      // (tuỳ bạn) lưu refresh token vào DB mỗi lần login
      const expiresAt = new Date(Date.now() + ms(process.env.REFRESH_EXPIRES || '7d'));
      await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        expiresAt,
      });

      return res.json({ accessToken, refreshToken, user: safeUser });
    } catch (e) {
      console.error('Login error:', e);
      return res.status(500).json({ msg: 'Server error' });
    }
  }
);

// ========== REFRESH ==========
router.post('/refresh', logActivity('REFRESH_TOKEN'), async (req, res) => {
  try {
    const { refreshToken } = (req.body || {});
    if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });

    // 1) Check DB token (not revoked)
    const found = await RefreshToken.findOne({ token: refreshToken, revokedAt: { $exists: false } });
    if (!found) return res.status(401).json({ message: 'Refresh token không hợp lệ' });

    // 2) Verify signature & expiration
    const payload = verifyRefresh(refreshToken); // { id, iat, exp }

    // 3) Load user
    const user = await User.findById(payload.id).select('email role');
    if (!user) {
      await RefreshToken.updateOne({ token: refreshToken }, { $set: { revokedAt: new Date() } });
      return res.status(401).json({ message: 'User không tồn tại' });
    }

    // 4) Issue new access token
    const accessToken = signAccess({ id: user._id, role: user.role, email: user.email });
    return res.json({ accessToken });
  } catch (err) {
    console.error('refresh error:', err);
    return res.status(401).json({ message: 'Refresh token hết hạn/không hợp lệ' });
  }
});

// ========== LOGOUT ==========
router.post('/logout', logActivity('LOGOUT'), async (req, res) => {
  try {
    const { refreshToken } = (req.body || {});
    if (refreshToken) {
      await RefreshToken.updateOne({ token: refreshToken }, { $set: { revokedAt: new Date() } });
    }
    return res.json({ message: 'Logged out' });
  } catch (e) {
    console.error('logout error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
