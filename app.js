var express = require('express');
var path = require('path');
var logger = require('morgan');
var fs = require('fs');
var bodyParser = require('body-parser');
var temp = 'phantomjs/temp';
// var db = require('./db');

var routes = require('./routes/index');
var evaluate = require('./routes/evaluate');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/evaluate', evaluate);

// init.initial();


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

if (!fs.existsSync(temp)){
    fs.mkdirSync(temp);
}

module.exports = app;
