// requireRole('Admin') -> chỉ Admin truy cập
// allowSelfOrAdmin: cho phép user tự xóa chính mình, hoặc Admin xóa bất kỳ ai
// middleware/rbac.js
function requireRole(roles) {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (Array.isArray(roles)) {
      if (!roles.includes(userRole)) return res.status(403).json({ message: 'Access denied' });
    } else {
      if (userRole !== roles) return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = { requireRole };
