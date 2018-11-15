var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var session = require('express-session')
var user = require('./routes/user')
var list = require('./routes/list')
var lists = require('./models/lists');
var users = require('./models/users')
var upload = multer();
var app = express();

mongoose.connect('mongodb://localhost/tododb');

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: "Your secret key"
}));
app.use('/user', user)
app.use('/list', list);
app.get('', (req, res) => {
    res.render('index')
})

app.listen(3000)