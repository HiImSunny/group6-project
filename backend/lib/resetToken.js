const crypto = require('crypto');
exports.createResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');                     // gửi qua email
  const hash  = crypto.createHash('sha256').update(token).digest('hex');    // lưu DB
  return { token, hash };
};
