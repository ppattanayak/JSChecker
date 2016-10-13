var redis = require('../storage/redis');
var emitter = require('./handler');

var engines = require('../engines');
var cache = require('./cache');

var config = cache.get('config');

var emitters = config.emitters;
var redisConfig = config.storage.redis;
var colors = require('colors/safe');

var intervalObj;

function updateRedis(data) {

    console.log(colors.cyan('Job Completed resetting redis to deafult: events.js/updateRedis function'));
    redis.getData(redisConfig.Objects.GlobalKeys.currentObjectName, function(err, id) {
        if (err) console.log(colors.red(err));
        if (id) {
            console.log(colors.cyan('Job Completed resetting redis to deafult: events.js/updateRedis:if function'));
            redis.setData(id, data, function(err, result) { // Storing SRI data into Object
                if (err) console.log(err);
                if (result) {
                    // emitter.emit(emitters.finished, id, data);
                    console.log(colors.cyan('Job Completed resetting redis to deafult: events.js/updateRedis:if:setData:if function'));
                    redis.setData(redisConfig.Objects.GlobalKeys.currentObjectName, '', function(err, result){
                        if(err) console.log(err);
                        console.log('Setting current Object Name to blank: ', result);
                    }); // Removing current Executing Object

                    redis.setData(redisConfig.Objects.GlobalKeys.globalOperationStatus, 0, function(err, result){
                        if(err) console.log(err);
                        console.log('Setting Operation Status to 0: ', result);
                    }); // Setting current execution status to 0

                    redis.expire(id, redisConfig.Objects.DefaultTexts.keyLife, function(err, result){
                        if(err) console.log(err);
                        console.log('Setting expiry of the key to '+ redisConfig.Objects.DefaultTexts.keyLife + 's: ', result);
                    }); // Setting key expiry for 24 hours

                    redis.incr(redisConfig.Objects.GlobalKeys.requestServed, function(err, result){
                        if(err) console.log(err);
                        console.log('Incrementing Request Counter : ', result);
                    });
                }else{
                    console.log('Error in setting result');
                    console.log(colors.cyan('Job Completed resetting redis to deafult: events.js/updateRedis:if:setData:else function'));
                }
            });
        }else{
            console.log('Error in getting current executing object');
            console.log(colors.cyan('Job Completed resetting redis to deafult: events.js/updateRedis:else function'));
        }
    });
}

function handleOutput(output){
    console.log(colors.cyan('Job Completed reset executing the callback function events.js/handleOutput', JSON.stringify(output)));
    if(output.status || output.code === 102){
        updateRedis(JSON.stringify(output));
    }else if(output.code === 101){
        clearInterval(intervalObj);
        console.log(output.message);
    }else{
        console.log(output.message);
    }
}

module.exports = {

    start: function(){
        var count = 0;
        redis.getData(redisConfig.Objects.GlobalKeys.intervalStatusVar, function(err, result){ // Is setInterval true
            if(err) return console.log(err);
            if(result === '0'){
                intervalObj = setInterval(function(){
                    count += 1;
                    console.log(colors.green('===================================== Running Job No : '+count+' ===================================='));
                    engines.start(handleOutput);

                    if(count === 15){
                        var output = {};
                        output.status = false;
                        output.code = 102;
                        output.message = "Time Exceeded. Some plugin failed to return response";
                        handleOutput(output);
                    }
                }, 3000);

                redis.setData(redisConfig.Objects.GlobalKeys.intervalStatusVar, 1, function(err, result){
                    if(err) console.log(err);
                    console.log(colors.magenta('Setting interval status true : ', result));
                });
            }
        });
    }
};
