const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const User = require('../models/User');

console.log('requireAuth:', typeof requireAuth);
console.log('requireRole:', typeof requireRole);

router.get('/users', requireAuth, requireRole(['admin', 'moderator']), async (req,res)=>{
  const users = await User.find().select('_id email role createdAt');
  res.json(users);
});


router.patch('/users/:id/role', requireAuth, requireRole('admin'), async (req,res)=>{
  const { role } = req.body;
  if (!['user','moderator','admin'].includes(role)) return res.status(400).json({ message:'Invalid role' });
  const u = await User.findByIdAndUpdate(req.params.id, { role }, { new:true }).select('_id email role');
  res.json(u);
});

module.exports = router;
