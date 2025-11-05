// backend/routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');
const ms = require('ms');

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name)
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });

    const existed = await User.findOne({ email });
    if (existed)
      return res.status(400).json({ message: 'Email đã tồn tại' });

    // KHÔNG cần hash ở đây, vì model đã có pre-save hook
    const user = await User.create({
      email,
      password,
      name,
      role: 'user',
    });

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

    res.json({
      message: 'Đăng ký thành công',
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Email không tồn tại' });

    const ok = await user.comparePassword(password);
    if (!ok)
      return res.status(400).json({ message: 'Sai mật khẩu' });

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

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
});

router.post('/refresh', async (req,res)=>{
  const { refreshToken } = req.body;
  if(!refreshToken) return res.status(400).json({ message:'Missing refresh token' });

  // 1) check DB token (and not revoked)
  const found = await RefreshToken.findOne({ token: refreshToken, revokedAt: { $exists:false } });
  if(!found) return res.status(401).json({ message:'Refresh token không hợp lệ' });

  try{
    // 2) verify JWT signature and expiration
    const payload = verifyRefresh(refreshToken); // { id, iat, exp }

    // 3) load user info (so access token contains role/email)
    const user = await User.findById(payload.id).select('email role');
    if(!user) {
      // Optionally revoke the refresh token for safety
      await RefreshToken.updateOne({ token: refreshToken }, { $set: { revokedAt: new Date() } });
      return res.status(401).json({ message:'User không tồn tại' });
    }

    // 4) issue new access token
    const accessToken = signAccess({ id: user._id, role: user.role, email: user.email });

    // 5) respond
    return res.json({ accessToken });
  } catch (err) {
    console.error('refresh error:', err);
    return res.status(401).json({ message:'Refresh token hết hạn/không hợp lệ' });
  }
});


router.post('/logout', async (req,res)=>{
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.updateOne({ token: refreshToken }, { $set: { revokedAt: new Date() } });
  }
  res.json({ message:'Logged out' });
});

module.exports = router;
