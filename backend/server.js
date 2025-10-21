require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log('Mongo connected'))
  .catch(err=>console.error('Mongo error', err));

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
