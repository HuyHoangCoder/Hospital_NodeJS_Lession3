const mysql = require('mysql');

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodelogin'
});

con.connect(function(err) {
  if (err) {
    throw err;
  } else {
    console.log('✅ Connected to database');
  }
});

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


module.exports.matchtoken = function(id, token, callback) {
  const query = "SELECT * FROM verify WHERE id = ? AND token = ?";
  con.query(query, [id, token], callback);
};


module.exports.updateverify = function(email, email_status, callback) {
  const query = "UPDATE users SET email_status = ? WHERE email = ?";
  con.query(query, [email_status, email], callback);
};

module.exports.findOne = function(email, callback){
  var query = "select * from users where email = '" + email + "'";
  con.query(query,callback);
  console.log(query);
}

module.exports.temp = function(id, email, token, callback) {
  var query = "insert into `temp`(`id`, `email`, `token`) values(?, ?, ?)";
  con.query(query, [id, email, token], callback);
  console.log(query);
};


module.exports.con = con; 