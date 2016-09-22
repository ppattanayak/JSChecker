var redis = require('./redis');
var tempServer = require('../phantomjs/server');
var phchecker = require('../phantomjs/checker');
var config = require('./global').config;
var queue = config.app.redis.Objects.GlobalKeys.taskqueue;
var intervalObj;

function updateRedis(sri) {

    redis.getData(config.app.redis.Objects.GlobalKeys.currentObjectName, function(err, result) {
        if (err) console.log(err);
        if (result) {
            redis.setData(result, sri, function(err, result) { // Storing SRI data into Object
                if (err) console.log(err);
                if (result) {
                    redis.setData(config.app.redis.Objects.GlobalKeys.currentObjectName, '', function(err, result){
                        if(err) console.log(err);
                        console.log('Setting current Object Name to blank: ', result);
                    }); // Removing current Executing Object
                    redis.setData(config.app.redis.Objects.GlobalKeys.operationStatusName, 0, function(err, result){
                        if(err) console.log(err);
                        console.log('Setting Operation Status to 0: ', result);
                    }); // Setting current execution status to 0
                    redis.expire(result, config.app.redis.Objects.DefaultTexts.keyLife, function(err, result){
                        if(err) console.log(err);
                        console.log('Setting expiry of the key to '+ config.app.redis.Objects.DefaultTexts.keyLife + 's: ', result);
                    }); // Setting key expiry for 24 hours
                    redis.incr(config.app.redis.Objects.GlobalKeys.requestServed, function(err, result){
                        if(err) console.log(err);
                        console.log('Incrementing Request Counter : ', result);
                    });
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
        redis.getData(config.app.redis.Objects.GlobalKeys.operationStatusName, function(err, result) {
            if (err) console.log(err);
            if (result === '0') {
                redis.rpop(queue, function(err, redisData) {
                    redisData = JSON.parse(redisData);
                    if(redisData){
                        console.log('Starting new job for ' + redisData.id);
                        redis.setData(config.app.redis.Objects.GlobalKeys.operationStatusName, 1, function(err, result){
                            if(err) console.log(err);
                            console.log(result);
                        }); // Setting current execution status to 1
                        redis.setData(redisData.id, config.app.redis.Objects.DefaultTexts.processingText, function(err, result){
                            if(err) console.log(err);
                            console.log(result);
                        }); // Setting Object status to processing
                        redis.setData(config.app.redis.Objects.GlobalKeys.currentObjectName, redisData.id, function(err, result){
                            if(err) console.log(err);
                            console.log(result);
                        }); // Storing current Executing Object
                        tempServer.startServer(function() {
                            phchecker.sricheck.start(redisData.url, function(status) {
                                stopServer(status);
                            });
                        });
                    }else{
                        console.log('No Data on found on Redis. Clearing Interval.');
                        clearInterval(intervalObj);
                        redis.setData(config.app.redis.Objects.GlobalKeys.intervalStatusVar, 0, function(err, result){
                            if(err) console.log(err);
                            console.log('Setting interval status false: ', result);
                        });
                    }
                });
            }else{
                console.log('Job already running..');
            }
        });
    } catch (e) {
        redis.setData(config.app.redis.Objects.GlobalKeys.operationStatusName, 0);
        console.log(e);
    }
}

module.exports = {

    start: function(){
        // console.log('Config file used :', app.get('config'));
        redis.getData(config.app.redis.Objects.GlobalKeys.intervalStatusVar, function(err, result){
            if(err) console.log(err);
            if(result === '0'){
                intervalObj = setInterval(function(){
                    console.log('===================================== Running Job ====================================');
                    start();
                }, 3000);
                redis.setData(config.app.redis.Objects.GlobalKeys.intervalStatusVar, 1, function(err, result){
                    if(err) console.log(err);
                    console.log('Setting interval status true : ', result);
                });
            }
        });
    }
};
