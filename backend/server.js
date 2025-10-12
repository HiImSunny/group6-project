const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://meankhoiii:Minhkhoi78757@cluster0.kghqnri.mongodb.net/groupDB?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const router = express.Router();
const userController = require('./controllers/userController');

app.use(express.json());

const User = require('./models/User');

const userRoutes = require('./routes/user');

app.use('/', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
