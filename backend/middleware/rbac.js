// requireRole('Admin') -> chỉ Admin truy cập
// allowSelfOrAdmin: cho phép user tự xóa chính mình, hoặc Admin xóa bất kỳ ai
exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.role || !roles.includes(req.user.role)) {
    return res.status(403).json({ msg: 'Forbidden: insufficient role' });
  }
  next();
};

exports.allowSelfOrAdmin = (paramUserIdField = 'id') => (req, res, next) => {
  const isAdmin = req.user?.role === 'admin';
  const targetId = req.params[paramUserIdField]; // /users/:id
  const isSelf = req.user?.id === targetId;
  if (isAdmin || isSelf) return next();
  return res.status(403).json({ msg: 'Forbidden: not self or admin' });
};
