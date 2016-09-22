var express = require('express');
var config = require('../src/global').config;
var redis = require('../src/redis');
var job = require('../src/events');
var randomstring = require('randomstring');

var redisVars = {
    queue: config.app.redis.Objects.GlobalKeys.taskqueue,
    defaultValueForIds: config.app.redis.Objects.DefaultTexts.defaultValueForQueue
};
var id = "";

var router = express.Router();

function pushToRedis(data, callback){
    console.log('Pushed ' + data + ' to redis');
    redis.lpush(redisVars.queue, data, callback);
}

router.get('/', function(req, res, next) {
    var url = req && req.query && req.query.url;
    id = config.app.redis.Objects.DefaultTexts.resultObjectPrefix+randomstring.generate(30) + new Date().getTime();
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
            console.log(result);
        });
        job.start();
        res.send('{"status":true, "queue":"'+result+'", "id":"'+id+'"}');
    });
});



module.exports = router;
