const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  action:   { type: String, index: true }, // ví dụ: LOGIN_SUCCESS, LOGIN_FAIL, PROFILE_UPDATE, AVATAR_UPLOAD, REFRESH_TOKEN, FORGOT_PW, RESET_PW,...
  ip:       { type: String },
  ua:       { type: String }, // user-agent
  path:     { type: String },
  method:   { type: String },
  status:   { type: Number },
  meta:     { type: Object }, // dữ liệu phụ: email, fileName, size, role, ...
  createdAt:{ type: Date, default: Date.now, index: true }
}, { versionKey: false });

module.exports = mongoose.model('Log', logSchema);
