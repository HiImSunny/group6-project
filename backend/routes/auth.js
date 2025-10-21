const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /signup
router.post('/signup', async (req,res)=>{
  try{
    const {name,email,password} = req.body;
    if(!name || !email || !password) return res.status(400).json({message:'Thiếu trường'});
    const exists = await User.findOne({email});
    if(exists) return res.status(400).json({message:'Email đã tồn tại'});
    const user = await User.create({name,email,password});
    res.status(201).json({id:user._id, email:user.email});
  }catch(e){ res.status(500).json({message:'Server error'}); }
});

// POST /login
router.post('/login', async (req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user || !(await user.comparePassword(password)))
    return res.status(400).json({message:'Sai email hoặc mật khẩu'});
  const token = jwt.sign({id:user._id, role:user.role}, process.env.JWT_SECRET, {expiresIn:'7d'});
  res.json({token});
});

// POST /logout  (client tự xoá token)
router.post('/logout', (_req,res)=> res.json({message:'Logged out'}));

module.exports = router;
