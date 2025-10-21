const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./models/User'); // đảm bảo model load

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/', require('./routes/auth'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`🚀 Server running http://localhost:${PORT}`));

