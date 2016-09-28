var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var cache = require('../../../../../../src/cache');
var config = cache.get('config');
var sriConfig = config.engines.plugins.sri || {};
var port = sriConfig.phantomjs.server.port;
var http = require('http');
module.exports = {

    startServer : function(callback){
        var app = express();

        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'hjs');

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(express.static(path.join(__dirname, 'public')));

        app.use('/', routes);

        app.use(function(req, res, next) {
          var err = new Error('Not Found');
          err.status = 404;
          next(err);
        });

        if (app.get('env') === 'development') {
          app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
              message: err.message,
              error: err
            });
          });
        }

        app.use(function(err, req, res, next) {
          res.status(err.status || 500);
          res.render('error', {
            message: err.message,
            error: {}
          });
        });

        app.set('port', port);

        var server = http.createServer(app);
        // server.listen(port);
        server.listen(port, function(){
            console.log('Testting Server Started at ' + port);
            // server.close(function(){
            //     console.log('Closing the server');
            // });
            callback(server);
        });
    }
};
