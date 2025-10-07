const express = require('express');
const app = express();

const router = express.Router();
const userController = require('./controllers/userController');

app.use(express.json());

const userRoutes = require('./routes/user');
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));