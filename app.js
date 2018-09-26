var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);
var db = require('./config/db')
var listItem = require('./models/list_items');
var lists = require('./models/lists');
var users = require('./models/users')
var upload = multer();
var app = express();

mongoose.connect('mongodb://localhost/tododb');

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());

app.listen(3000)