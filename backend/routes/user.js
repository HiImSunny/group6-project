const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole, allowSelfOrAdmin } = require('../middleware/rbac');
const User = require('../models/User');

router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { q = '', role, page = 1, limit = 20 } = req.query;

    // Bộ lọc cơ bản
    const filter = {};

    // Tìm kiếm theo từ khóa (email, name)
    if (q) {
      filter.$or = [
        { email: { $regex: q, $options: 'i' } },
        { name:  { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }

    // Lọc theo vai trò (User / Admin)
    if (role) filter.role = role;

    // Phân trang
    const skip = (Number(page) - 1) * Number(limit);

    // Lấy dữ liệu và tổng số lượng song song
    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    // Phản hồi JSON
    res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', auth, allowSelfOrAdmin('id'), async (req, res) => {
  try {
    const { id } = req.params;

    // HARD DELETE:
    const del = await User.findByIdAndDelete(id);

    if (!del) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Trả về thông báo sau khi xóa thành công
    return res.status(200).json({
      msg: 'User permanently deleted',
      id,
      hard: true
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
