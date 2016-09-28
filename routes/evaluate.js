var express = require('express');
var cache = require('../src/cache');
var redis = require('../storage/redis');
var job = require('../src/events');
var randomstring = require('randomstring');
var emitter = require('../src/handler');

var config = cache.get('config');
var emitters = config.emitters;
var redisConfig = config.storage.redis;

var redisVars = {
    queue: redisConfig.Objects.GlobalKeys.taskqueue,
    defaultValueForIds: redisConfig.Objects.DefaultTexts.defaultValueForQueue
};
var id = "";

var router = express.Router();

function pushToRedis(data, callback){
    console.log('Pushed ' + data + ' to redis');
    redis.lpush(redisVars.queue, data, callback);
}

router.get('/', function(req, res, next) {
    var url = req && req.query && req.query.url;
    id = redisConfig.Objects.DefaultTexts.resultObjectPrefix+randomstring.generate(30) + new Date().getTime();
    console.log('Random String : ', id);

    var redisData = {};
        redisData.id = id;
        redisData.url = url;

    console.log(JSON.stringify(redisData));

    pushToRedis(JSON.stringify(redisData), function(err, result){
        if(err) console.log(err);
        console.log('Queue No : ' + result);
        redis.setData(id, redisVars.defaultValueForIds, function(err, result){
            if(err) console.log(err);
            console.log('Setting Default Value For :'+id, result);
        });
        // emitter.emit(emitters.newrequest, id, url);
        job.start();
        res.send('{"status":true, "queue":"'+result+'", "id":"'+id+'"}');
    });
});



module.exports = router;
