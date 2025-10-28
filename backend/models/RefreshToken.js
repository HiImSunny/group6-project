const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  token: { type: String, required: true, unique: true },
  userAgent: String,
  ip: String,
  revokedAt: Date,
  expiresAt: { type: Date, required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
