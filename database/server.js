const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();

app.use(express.json());

// Kết nối MongoDB Atlas
mongoose.connect('mongodb+srv://meankhoiii:Minhkhoi78757@cluster0.kghqnri.mongodb.net/groupDB?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error(err));

// POST: thêm người dùng
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: lấy danh sách người dùng
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));
