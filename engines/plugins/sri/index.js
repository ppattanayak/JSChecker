var tempServer = require('./tools/phantomjs/server');
var phchecker = require('./tools/phantomjs/checker');
var fs = require('fs');
var temp = 'tools/phantomjs/temp';

process.chdir('engines/plugins/sri/');
if (!fs.existsSync(temp)) {
    fs.mkdirSync(temp);
}

function stopServer(job, status, callback) {
    if (status === 'success') {
        console.log('Stop Server method called with success');
        tempServer.stopServer();
    } else {
        console.log('Stop Server method called with failed status');
        tempServer.stopServer();
    }

    phchecker.sricheck.evaluateAllUrls(function(sri) {
        console.log('Evaluate ALL URLS :', sri);
        callback(job, sri);
    });
}

module.exports = function(job, callback){
    console.log('-------------------------------- ', job);
    tempServer.startServer(function() {
        phchecker.sricheck.start(job.url, function(status) {
            stopServer(job, status, callback);
        });
    });
};
