const express = require('express');
const router = express.Router();
const db = require.main.require('./models/db_controller');
const nodemailer = require('nodemailer');
const randomToken = require('random-token');

router.post('/', function(req, res){
  var email = req.body.email;
  
  // Kiểm tra email tồn tại trong database
  db.findOne(email, function(err, resultone){
    if (err) {
      console.log("Error occurred:", err);
      return res.status(500).send("Internal server error");
    }

    if(!resultone) {
      console.log("Mail does not exist");
      return res.send("Mail does not exist");
    } else {
      var id = resultone[0].id;
      var email = resultone[0].email;
      var token = randomToken(16); // Tạo token ngẫu nhiên

      // Lưu token vào bảng tạm thời
      db.temp(id, email, token, function(err, resulttwo) {
        if (err) {
          console.log("Error saving token:", err);
          return res.status(500).send("Internal server error");
        }

        // Soạn nội dung email
        var output = `
          <p>Dear user,</p>
          <p>You are receiving this email because you requested to reset your password.</p>
          <ul>
            <li>User ID: ${id}</li>
            <li>Token: ${token}</li>
          </ul>
        `;

        // Cấu hình Nodemailer
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER, // lấy từ biến môi trường
            pass: process.env.EMAIL_PASS  // lấy từ biến môi trường
          }
        });

        var mailOptions = {
          from: 'HMS Team',
          to: email,
          subject: 'Password reset',
          html: output
        };

        // Gửi email
        transporter.sendMail(mailOptions, function(err, info) {
          if (err) {
            console.log("Error sending mail:", err);
            return res.status(500).send("Error sending email.");
          } else {
            console.log(info);
            res.send("A token has been sent to your email address.");
          }
        });
      });
    }
  });
});

module.exports = router;
