const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole, allowSelfOrAdmin } = require('../middleware/rbac');
const User = require('../models/User');

/**
 * GET /users
 * - Admin-only
 * - Hỗ trợ query: ?q=abc&role=User&limit=20&page=1
 */
router.get('/', auth, requireRole('Admin'), async (req, res) => {
  try {
    const { q = '', role, page = 1, limit = 20 } = req.query;
    const filter = { isDeleted: false };
    if (q) {
      filter.$or = [
        { email: { $regex: q, $options: 'i' } },
        { name:  { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter)
    ]);
    res.json({
      items,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * DELETE /users/:id
 * - Admin có thể xóa bất kỳ ai
 * - User có thể tự xóa tài khoản của mình (self-delete)
 * - Chọn 1 trong 2: soft delete (isDeleted=true) HOẶC hard delete
 */
router.delete('/:id', auth, allowSelfOrAdmin('id'), async (req, res) => {
  try {
    const { id } = req.params;

    // SOFT-DELETE:
    const user = await User.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    return res.status(200).json({ msg: 'Deleted', id, soft: true });

    // Nếu muốn hard-delete thì thay bằng:
    // const del = await User.findByIdAndDelete(id);
    // if (!del) return res.status(404).json({ msg: 'User not found' });
    // return res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
