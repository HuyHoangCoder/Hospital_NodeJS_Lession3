models

db_controller.js

<aside>
💡

```jsx
// Đăng ký tài khoản
module.exports.signup = function(username, email, password, status, callback) {
  const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';

  con.query(checkEmailQuery, [email], function(err, result) {
    if (err) return callback(err);

    if (!result || result.length === 0) {
      const insertQuery = 'INSERT INTO users (username, email, password, email_status) VALUES (?, ?, ?, ?)';
      con.query(insertQuery, [username, email, password, status], callback);
    } else {
      // Email đã tồn tại
      return callback(new Error('Email already exists.'));
    }
  });
};

// Lưu token xác minh
module.exports.verify = function(username, email, token, callback) {
  const query = 'INSERT INTO verify (username, email, token) VALUES (?, ?, ?)';
  con.query(query, [username, email, token], callback);
};

// Lấy user ID qua email
module.exports.getuserid = function(email, callback) {
  const query = 'SELECT * FROM verify WHERE email = ?';
  con.query(query, [email], callback);
};

```

</aside>

controllers

signup.js

<aside>
💡

```jsx
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

```

</aside>

app.js

<aside>
💡

```jsx
var express = require('express');
var session = require('express-session');
var cookie = require('cookie-parser');
require('dotenv').config();
var path = require('path');
var ejs = require('ejs');
var multer = require('multer');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var expressValidator = require('express-validator');
var sweetalert = require('sweetalert2');
var bodyParser = require('body-parser');
const http = require('http');
const db = require('./models/db_controller');
const signup = require('./controllers/signup');
var app = express();

app.set('view engine', 'ejs');
const server = http.createServer(app);
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookie());
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server runing on ${PORT}`));
app.use('/signup', signup);
```

</aside>
