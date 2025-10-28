// middleware/auth.js
const { verifyAccess } = require('../utils/jwt');

const requireAuth = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No access token' });

  try {
    const payload = verifyAccess(token);
    req.user = payload; // { id, role, email }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid/expired access token' });
  }
};

// Export đúng kiểu cũ → require() sẽ nhận được hàm
module.exports = requireAuth;