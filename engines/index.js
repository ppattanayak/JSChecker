var redis = require('../storage').redis;
var config = require('../src/cache').get('config');
var redisConfig = config.storage.redis;
var emitters = require('../src/handler');
var emitter = config.emitters;
var http = require('http');
var https = require('https');
var colors = require('colors/safe');

var plugins = [];
var pluginsConfig = config.engines.sortedPlugins;

var localVars = {
    job: {}
};

for (var i = 0; i < pluginsConfig.length; i++) {
    var plugin = require('./plugins/' + pluginsConfig[i].key);
    plugins.push(plugin);
}

function updateRedisToRunJob(redisData) {

    return new Promise(function (fulfill, reject){
        console.log('Starting new job for ' + redisData.id);
        redis.setData(redisConfig.Objects.GlobalKeys.globalOperationStatus, 1, function(err, result) {
            if (err) {
                console.log(err);
                reject(err);
            }
            console.log(result);
        }); // Setting current execution status to 1
        redis.setData(redisData.id, redisConfig.Objects.DefaultTexts.processingText, function(err, result) {
            if (err) {
                console.log(err);
                reject(err);
            }
            console.log(result);
        }); // Setting Object status to processing
        redis.setData(redisConfig.Objects.GlobalKeys.currentObjectName, redisData.id, function(err, result) {
            if (err) {
                console.log(err);
                reject(err);
            }
            console.log(result);
        });

        fulfill(true);
    });
}

function checkValidityOfURL(requrl, callback) {
    var output = {};
    try{
        var request;
        if(requrl.startsWith('https')){
            var urlsplit = requrl.split('/');
            var port = urlsplit[2].split(':')[1] || 443;
            var options = {
                host: urlsplit[2].split(':')[0],
                port : port,
                path: '/' + urlsplit.slice(3).join('/') || '/',
                method: 'GET',
                rejectUnauthorized: false,
                requestCert: false,
                agent: false
            };
            request = https.request(options, function(res){
                if(res.statusCode !== 200){
                    output.status = false;
                }else{
                    output.status = true;
                }
                callback(output);
            });
        }else{
            request = http.get(requrl, function(res){
                if(res.statusCode !== 200){
                    output.status = false;
                }else{
                    output.status = true;
                }

                callback(output);
            });
        }

        request.on('error', function(err){
            console.log(err);
            output.status = false;
            callback(output);
        }).end();

    }catch(e){
        console.log(e);
        output.status = false;
        callback(output);
    }
}

function runAllPlugins(redisData, callback) {
    var pluginExecutionCompleted = 0;
    console.log(colors.cyan('Plugin Execution Step 4 at engines/index.js inside runAllPlugin function'));
    checkValidityOfURL(redisData.url, function(finalOutput) {
        if (finalOutput.status) {
            console.log(colors.cyan('Plugin Execution Step 5 at engines/index.js inside runAllPlugin:if statement'));
            finalOutput.plugins = {};
            for (var i = 0; i < plugins.length; i++) {
                console.log(colors.cyan('Plugin Execution Step 6 at engines/index.js inside runAllPlugin:if:for loop', pluginsConfig[i].key));
                var runPlugin = plugins[i];
                var job = {};
                job.id = redisData.id;
                job.url = redisData.url;
                job.pluginName = pluginsConfig[i].key;

                if (typeof runPlugin === 'function') {
                    runPlugin(job, function(rjob, output) {
                        pluginExecutionCompleted += 1;
                        console.log(colors.green('Plugin '+ rjob.pluginName + ' completed with output : ' + JSON.stringify(output)));
                        if (output && output !== '{}' && output !== {}) {
                            output.headerName = config.engines.plugins[rjob.pluginName].name || "No Name";
                            finalOutput.plugins[rjob.pluginName] = output || {};
                            if (pluginExecutionCompleted === plugins.length) {
                                console.log('Final Output Before Callback : ', finalOutput);
                                callback(finalOutput);
                            }
                        }else{
                            if (pluginExecutionCompleted === plugins.length) {
                                console.log(colors.red('No Output found from ' + job.pluginName));
                                callback(finalOutput);
                            }
                        }
                    });
                } else {
                    emitters.emit(emitter.fatalerror, 'plugin', pluginsConfig[i].key + ' is not defined');
                }
            }
        } else {
            console.log(colors.cyan('Plugin Execution Step 5 at engines/index.js inside runAllPlugin:else statement'));
            finalOutput.message = 'Invalid resource found!!';
            finalOutput.invalidurls = [];
            finalOutput.invalidurls.push(redisData.url);
            finalOutput.code = 102;
            console.log(finalOutput);
            callback(finalOutput);
        }
    });
}

function emptyRedis(callback) {
    console.log('No Data on found on Redis. Clearing Interval.');
    redis.setData(redisConfig.Objects.GlobalKeys.intervalStatusVar, 0, function(err, result) {
        if (err) return console.log(err);
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
                if (err) return console.log(colors.red(err));
                if (result === '0') {
                    console.log(colors.cyan('Plugin Execution Step 1 at engines/index.js inside if statement'));
                    redis.rpop(redisConfig.Objects.GlobalKeys.taskqueue, function(err, redisData) {
                        console.log('Popping Data : ', redisData);
                        redisData = JSON.parse(redisData);
                        if (redisData) {
                            console.log(colors.cyan('Plugin Execution Step 2 at engines/index.js inside if:if statement'));
                            updateRedisToRunJob(redisData).then(function(result){
                                if(result === true){
                                    console.log(colors.cyan('Plugin Execution Step 3 at engines/index.js inside if:if:if statement'));
                                    runAllPlugins(redisData, callback);
                                }
                            }).catch(function(err){
                                console.log(err);
                            }); //Updating redis and running all plugins
                        } else {
                            console.log(colors.cyan('Plugin Execution Step 2 at engines/index.js inside if:else statement. Terminating, no redisData'));
                            emptyRedis(callback);
                        }
                    });
                } else {
                    console.log(colors.cyan('Plugin Execution Step 1 at engines/index.js inside else statement'));
                    console.log('Job already running..');
                    var error = {};
                    error.status = false;
                    error.code = 100;
                    error.message = 'Job already running';
                    callback(error);
                }
            });
        } catch (e) {
            redis.setData(redisConfig.Objects.GlobalKeys.globalOperationStatus, 0);
            console.log(e);
        }
    }
};
