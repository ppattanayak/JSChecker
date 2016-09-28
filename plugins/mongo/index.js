var mongoose = require('mongoose');
var config = require('../../src/global').config;
var emitter = require('../../src/handler');
var schema = require('./config/schema.json');
var emitters = config.emitters;

var mongoconf = config.plugins.mongo.settings;

var connectionString = 'mongodb://'+mongoconf.host+':'+mongoconf.port+'/'+mongoconf.dbname;

mongoose.connect(connectionString);
var db = mongoose.connection;

db.on('error', function(error){
    emitter.emit(emitters.fatalerror, 'mongo', 'Connection Error : '+error);
});

db.once('open', function(){
    console.log('Mongo DB connected');
});

var resultSchema = mongoose.Schema(schema.result);
var Result = mongoose.model('Result', resultSchema);

emitter.on(emitters.finished, function(id, sri){
    console.log('============================== Event Handler Finished Called =======================');
    var data = new Result({"key":id, "result":sri});
    data.save(function(err, data){
        if(err) return console.log(err);
        console.log('Data Inserted');
    });
});

emitter.on(emitters.needdata, function(id, req){
    console.log('============================== Event Handler Need Data Called =======================');
    req.out = req.out || {};
    Result.findOne({"key":id}, function(err, data){
        if(err) return console.log(err);
        if(data){
            console.log('data found :', data.result);
            req.out.data = data.result;
        }
    });
});

module.exports = function(req, res, next){
    // console.log(req);
};
