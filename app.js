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
const login = require('./controllers/login');
const verify = require('./controllers/verify');
const reset = require('./controllers/reset_controller');


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
app.use('/login', login);
app.use('/verify', verify);
app.use('/reset', reset);