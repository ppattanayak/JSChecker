var config = require('../config/config.json');

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
    redis.set(config.app.redis.operationStatusText, 0);

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
    }

};
