var express = require('express');
var router = express.Router();
var template = require('./marko/template.marko');
var cache = require('../../src/cache');
var app = require('../../app');
var path = require('path');

/* GET home page. */
// app.set('views', path.join(__dirname, 'marko'));
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'JSChecker' });
  var options = {
      title: "JSChecker",
      plugins: cache.get('allActivePlugin')

  };
  template.render(options, res);
});

module.exports = router;
