var express = require('express');
var app = express();
var morgan = require('morgan');

app.use(morgan('tiny'));
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/node_modules'));

app.get('*', (req, res) => {
    res.sendFile('/index.html', {root: __dirname});
});

app.listen(8999);