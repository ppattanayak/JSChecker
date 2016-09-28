var server = require('./app');
var globalServer;

module.exports = {

    startServer: function(callback){
        server.startServer(function(app){
            globalServer = app;
            callback();
        });
    },

    stopServer: function(){
        globalServer.close(function(){
            console.log('Closing Server');
        });
    }
};
