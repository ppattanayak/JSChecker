var redis = require('./redis');
var tempServer = require('../phantomjs/server');
var phchecker = require('../phantomjs/checker');
var config = require('../config/config.json');
var queue = config.app.redis.taskqueue;

function updateRedis(sri) {

    redis.getData(config.app.redis.currentObjectName, function(err, result) {
        if (err) console.log(err);
        if (result) {
            redis.setData(result, sri, function(err, result) {
                if (err) console.log(err);
                if (result) {
                    redis.setData(config.app.redis.currentObjectName, '', function(err, result){
                        if(err) console.log(err);
                        console.log(result);
                    }); // Removing current Executing Object
                    redis.setData(config.app.redis.operationStatusText, 0, function(err, result){
                        if(err) console.log(err);
                        console.log(result);
                    }); // Setting current execution status to 0
                }else{
                    console.log('Error in setting result');
                }
            });
        }else{
            console.log('Error in getting current executing object');
        }
    });
}

function stopServer(status) {
    if (status === 'success') {
        console.log('Stop Server method called with success');
        tempServer.stopServer();
    } else {
        console.log('Stop Server method called with failed status');
        tempServer.stopServer();
    }

    phchecker.sricheck.evaluateAllUrls(function(sri) {
        console.log(sri);
        updateRedis(sri);
    });
}

function start() {
    try {
        redis.getData(config.app.redis.operationStatusText, function(err, result) {
            if (err) console.log(err);
            if (result === '0') {
                redis.rpop(queue, function(err, redisData) {
                    redisData = JSON.parse(redisData);
                    if(redisData){
                        console.log('Starting new job for ' + redisData.id);
                        redis.setData(config.app.redis.operationStatusText, 1, function(err, result){
                            if(err) console.log(err);
                            console.log(result);
                        }); // Setting current execution status to 1
                        redis.setData(redisData.id, config.app.redis.processingText, function(err, result){
                            if(err) console.log(err);
                            console.log(result);
                        }); // Setting Object status to processing
                        redis.setData(config.app.redis.currentObjectName, redisData.id, function(err, result){
                            if(err) console.log(err);
                            console.log(result);
                        }); // Storing current Executing Object
                        tempServer.startServer(function() {
                            phchecker.sricheck.start(redisData.url, function(status) {
                                stopServer(status);
                            });
                        });
                    }else{
                        console.log('No Data on found on Redis');
                    }
                });
            }else{
                console.log('Job already running..');
            }
        });
    } catch (e) {
        redis.setData(config.app.redis.operationStatusText, 0);
        console.log(e);
    }
}

module.exports = {
    start: function(){
        console.log('===================================== Running Job ====================================');
        start();
    }
};
