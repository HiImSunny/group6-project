const jwt = require('jsonwebtoken');
module.exports = function(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role }; // đảm bảo đã ký kèm role khi login
    next();
  } catch {
    return res.status(401).json({ msg: 'Token invalid' });
  }
};