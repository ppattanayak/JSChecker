var redis = require('../storage').redis;
var config = require('../src/cache').get('config');
var redisConfig = config.storage.redis;
var emitters = require('../src/handler');
var emitter = config.emitters;

var plugins = [];
var pluginsConfig = config.engines.sortedPlugins;

var localVars = {
    job: {}
};

for(var i = 0; i < pluginsConfig.length; i++){
    var plugin = require('./plugins/'+pluginsConfig[i].key);
    plugins.push(plugin);
}

function updateRedisToRunJob(redisData){
    console.log('Starting new job for ' + redisData.id);
    redis.setData(redisConfig.Objects.GlobalKeys.globalOperationStatus, 1, function(err, result){
        if(err) console.log(err);
        console.log(result);
    }); // Setting current execution status to 1
    redis.setData(redisData.id, redisConfig.Objects.DefaultTexts.processingText, function(err, result){
        if(err) console.log(err);
        console.log(result);
    }); // Setting Object status to processing
    redis.setData(redisConfig.Objects.GlobalKeys.currentObjectName, redisData.id, function(err, result){
        if(err) console.log(err);
        console.log(result);
    });
}

function runAllPlugins(redisData, callback){
    var pluginExecutionCompleted = 0;
    var finalOutput = {};
    finalOutput.plugins = {};

    for(var i = 0; i < plugins.length; i++){
        var runPlugin = plugins[i];
        localVars.job.id = redisData.id;
        localVars.job.url = redisData.url;
        localVars.job.pluginName = pluginsConfig[i].key;
        if(typeof runPlugin === 'function'){
            runPlugin(localVars.job, function(job, output){
                // storage.saveData(job.id, output);
                pluginExecutionCompleted +=1;
                finalOutput.plugins[job.pluginName] = output;
                if(pluginExecutionCompleted === plugins.length){

                    finalOutput.status = true;
                    console.log('Final Output Before Callback : ', finalOutput);
                    callback(finalOutput);
                }
            });
        }else{
            emitters.emit(emitter.fatalerror, 'plugin', pluginsConfig[i].key + ' is not defined');
        }
    }
}

function emptyRedis(callback){
    console.log('No Data on found on Redis. Clearing Interval.');
    redis.setData(redisConfig.Objects.GlobalKeys.intervalStatusVar, 0, function(err, result){
        if(err) return console.log(err);
        console.log('Setting interval status false: ', result);
        var message = {};
        message.status = false;
        message.code = 101;
        message.message = "No Data on found on Redis";
        callback(message);
    });
}

module.exports = {

     start: function(callback) {
        try {
            redis.getData(redisConfig.Objects.GlobalKeys.globalOperationStatus, function(err, result) {
                if (err) return console.log(err);
                if (result === '0') {
                    redis.rpop(redisConfig.Objects.GlobalKeys.taskqueue, function(err, redisData) {
                        console.log('Popping Data : ', redisData);
                        redisData = JSON.parse(redisData);
                        if(redisData){
                            updateRedisToRunJob(redisData); //Updating redis
                            runAllPlugins(redisData, callback);
                        }else{
                            emptyRedis(callback);
                        }
                    });
                }else{
                    console.log('Job already running..');
                    var error = {};
                    error.status = false;
                    error.code = 100;
                    error.mesasge = 'Job already running';
                    callback(error);
                }
            });
        } catch (e) {
            redis.setData(redisConfig.Objects.GlobalKeys.globalOperationStatus, 0);
            console.log(e);
        }
    }
};
