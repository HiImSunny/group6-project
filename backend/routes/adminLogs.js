const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const { requireAuth, checkRole } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// GET /admin/logs?userId=&action=&from=&to=&page=1&limit=20
router.get('/admin/logs', requireAuth, requireRole(['admin', 'moderator']), async (req, res) => {
  try {
    const { userId, action, from, to, page = 1, limit = 20 } = req.query;
    const q = {};
    if (userId) q.userId = userId;
    if (action) q.action = action;
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to)   q.createdAt.$lte = new Date(to);
    }

    const skip = (Math.max(+page,1)-1) * Math.max(+limit,1);
    const [items, total] = await Promise.all([
      Log.find(q).sort({ createdAt: -1 }).skip(skip).limit(Math.max(+limit,1)),
      Log.countDocuments(q)
    ]);

    res.json({
      page: +page, limit: +limit, total,
      items
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
