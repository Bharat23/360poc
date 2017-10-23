var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var fileUpload = require('express-fileupload');

app.use(morgan('tiny'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload());

app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/node_modules'));

app.use('/api', require('./api'));

app.get('/checkAuth', (req, res) => {
    res.sendFile('/auth.html', {root: __dirname})
});

app.get('*', (req, res) => {
    res.sendFile('/index.html', {root: __dirname});
});

app.listen(8999);