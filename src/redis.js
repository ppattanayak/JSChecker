var config = require('./global').config;

var options = {
    port: config.app.redis.port,
    host: config.app.redis.host,
    password: config.app.redis.authPassword,
    keyPrefix: config.app.redis.keyPrefix,
    dropBufferSupport: true,
    family: 4,
    db: 0
};

var Redis = require('ioredis');
var redis = new Redis(options);
    redis.set(config.app.redis.Objects.GlobalKeys.operationStatusName, 0);
    redis.set(config.app.redis.Objects.GlobalKeys.intervalStatusVar, 0);

redis.get(config.app.redis.Objects.GlobalKeys.requestServed, function(err, result){
    if(!result){
        redis.set(config.app.redis.Objects.GlobalKeys.requestServed, 0, function(err, result){
            if(err) console.log(err);
            console.log('Setting request server counter to 0 : ', result);
        });
    }
});

module.exports = {
    setData: function(key, value, callback) {
        console.log('Setting Data : ' + key + ' : ' + value);
        redis.set(key, value, callback);
    },

    getData: function(key, callback) {
        console.log('Getting Data : ' + key);
        redis.get(key, callback);
    },

    lpush: function(key, value, callback){
        console.log('L Pushing Data : ' + key + ' : ' + value);
        redis.lpush(key, value, callback);
    },

    rpop: function(key, callback){
        console.log('R Popping Data : ' + key);
        redis.rpop(key, callback);
    },

    rpush: function(key, value, callback){
        console.log('R Pushing Data : ' + key + ' : ' + value);
        redis.lpush(key, value, callback);
    },

    lpop: function(key, callback){
        console.log('L Popping Data : ' + key);
        redis.rpop(key, callback);
    },

    lrange: function(key, callback){
        console.log('LRange Data : ' + key);
        redis.lrange(key, 0, -1, callback);
    },

    exists: function(key, callback) {
        console.log('Exist Data : ' + key);
        redis.exists(key, callback);
    },

    llen: function(key, callback) {
        console.log('Length Data : ' + key);
        redis.llen(key, callback);
    },

    expire: function(key, time, callback) {
        console.log('Setting Expire For : ' + key + " to "+ time);
        redis.expire(key, time, callback);
    },

    incr: function(key, callback){
        console.log('Incrementing : ' + key);
        redis.incr(key, callback);
    }

};
