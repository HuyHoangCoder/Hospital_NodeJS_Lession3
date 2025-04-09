const express = require('express');
const router = express.Router();
const db = require.main.require('./models/db_controller');
const nodemailer = require('nodemailer');
const randomToken = require('random-token');
const { check, validationResult } = require('express-validator');

// POST /signup
router.post('/', [
  check('username').notEmpty().withMessage("Username is required"),
  check('email').isEmail().withMessage("Valid email is required"),
  check('password').notEmpty().withMessage("Password is required")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  const email_status = "not_verified";
  const token = randomToken(8);

  try {
    // Đăng ký người dùng
    await new Promise((resolve, reject) => {
      db.signup(username, email, password, email_status, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Lưu token xác minh
    await new Promise((resolve, reject) => {
      db.verify(username, email, token, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Lấy user ID
    const user = await new Promise((resolve, reject) => {
      db.getuserid(email, (err, result) => {
        if (err || !result || result.length === 0) return reject("User not found");
        resolve(result[0]);
      });
    });

    // Soạn nội dung email
    const output = `
      <p>Dear ${username},</p>
      <p>Thanks for signing up. Your verification ID and token are below:</p>
      <ul>
        <li>User ID: ${user.id}</li>
        <li>Token: ${token}</li>
      </ul>
      <p>Verify link: <a href="http://localhost:3000/verify">Verify</a></p>
      <p><b>This is an automatically generated email.</b></p>
    `;

    // Gửi email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || "your_email@gmail.com",
        pass: process.env.EMAIL_PASS || "your_app_password"
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your_email@gmail.com',
      to: email,
      subject: 'Email Verification',
      html: output
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send("✅ Check your email for the token to verify.");
  } catch (err) {
    console.error("❌ Error during signup:", err);
    res.status(500).send("Something went wrong. Please try again.");
  }
});

module.exports = router;
