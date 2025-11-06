// backend/lib/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,          // ví dụ: yourname@gmail.com
    pass: process.env.SMTP_PASS,  // App Password 16 ký tự
  },
});

async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"Group 6" <${process.env.SMTP_USER}>`,
    to, subject, html
  });
}

module.exports = { sendMail };
