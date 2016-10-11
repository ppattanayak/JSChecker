var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {

    function renderHTML(options, callback){

        // var jsprime = options.data.result;
        // var title = options.title;

        var html = '<div id="jsprime"><h1>JSPrime</h1></div>';
        callback(html);
    }

    var options = {
        title: 'JSPrime',
        data: req.body
    };

    renderHTML(options, function(html){
        res.send(html);
    });
});

router.get('/', function(req, res, next){
    res.send(req.route);
});

module.exports = router;
