const express = require('express');
const router = express.Router();
const db = require.main.require('./models/db_controller');
const session = require('express-session');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const mysql = require('mysql'); // nếu dùng trực tiếp con.query()

const con = db.con; // nếu bạn export từ db_controller

router.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/', [
  check('username').notEmpty().withMessage("Username is required"),
  check('password').notEmpty().withMessage("Password is required")
], function(request, response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() });
  }

  const username = request.body.username;
  const password = request.body.password;

  if (username && password) {
    con.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
      if (error) {
        console.error("MySQL error:", error);
        return response.status(500).send("Internal server error");
      }

      if (results.length > 0) {
        request.session.loggedin = true;
        request.session.username = username;
        response.cookie('username', username);

        const status = results[0].email_status;
        if (status === "not_verified") {
          return response.send("Please verify your email");
        } else {
          return response.redirect('/home');
        }
      } else {
        return response.send("Incorrect username or password");
      }
    });
  } else {
    return response.status(400).send("Missing username or password");
  }
});

module.exports = router;
