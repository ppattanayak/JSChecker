var express = require('express');
var tempServer = require('../phantomjs/server');
var phchecker = require('../phantomjs/checker');

var router = express.Router();

function stopServer(status, res) {
    if (status === 'success') {
        console.log('Stop Server method called with success');
        tempServer.stopServer();
    } else {
        console.log('Stop Server method called with failed status');
        tempServer.stopServer();
    }

    phchecker.sricheck.evaluateAllUrls(function(sri){
        console.log(sri);
        res.send(sri);
    });
}

router.get('/', function(req, res, next) {
    var url = req && req.query && req.query.url;
    console.log(url);

    tempServer.startServer(function() {
        phchecker.sricheck.start(url, function(status){
            stopServer(status, res);
        });
    });

});



module.exports = router;
