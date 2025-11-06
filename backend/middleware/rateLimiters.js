const rateLimit = require('express-rate-limit');

// ví dụ: tối đa 5 request/15 phút cho LOGIN theo mỗi IP
const loginLimiter = rateLimit({
  windowMs: 15*60*1000,
  max: 5,
  message: { msg: 'Too many login attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ví dụ: tối đa 5 request/15 phút cho FORGOT PASSWORD
const forgotPwLimiter = rateLimit({
  windowMs: 15*60*1000,
  max: 5,
  message: { msg: 'Too many requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { loginLimiter, forgotPwLimiter };
