var express = require('express');
var router = express.Router();
var redis = require('../../storage/redis');
var cache = require('../../src/cache');
var config = cache.get('config');
var emitter = require('../../src/handler');

var redisConfig = config.storage.redis;
var queue = redisConfig.Objects.GlobalKeys.taskqueue;
var emitters = config.emitters;

function checkLrange(id, res){
    redis.lrange(queue, function(err, result){
        if(err) console.log(err);
        for(var i = 1; i <= result.length; i++){
            var entry = JSON.parse(result[result.length - i]);
            if(entry.id === id){
                res.send('{"status":"info", "queue":"'+i+'", "message":"This request is currently in queue and will start processing shortly."}');
                break;
            }else if(entry.id !== id && i === result.length){
                res.send('{"status":"info", "queue":"-1", "message":"This request is currently in queue and will start processing shortly."}');
            }
        }
    });
}

router.get('/:id', function(req, res, next) {
    var id = req.params.id;
    console.log('Concat ID : ', id);
    redis.exists(id, function(err, result){
        if(err) return console.log(err);
        console.log('Result : ', result);
        if(result){
            redis.getData(id, function(err, result){
                if(err) console.log(err);
                console.log(result);
                if(result && result !== redisConfig.Objects.DefaultTexts.defaultValueForQueue && result !== redisConfig.Objects.DefaultTexts.processingText){
                    res.send(result);
                }else{
                    checkLrange(id, res);
                }
            });
        }else{
            res.send('{"status":false, "message":"Invalid ID. No data found for this ID."}');
        }
    });
});

module.exports = router;
