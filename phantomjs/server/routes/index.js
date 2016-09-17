var express = require('express');
var router = express.Router();
// var appObj = require('../app');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
      title: 'JSChecker',
      url: req.query.url
  });
});

module.exports = router;
