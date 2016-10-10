var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var job = require('./src/events');
var cache = require('./src/cache');
var fs = require('fs');
var colors = require('colors/safe');

require('marko/node-require').install();

var config = cache.get('config');
var plugins = config.engines.sortedPlugins;
var allActivePlugin = [];

var routes = require('./routes/index');
var evaluate = require('./routes/evaluate');
var status = require('./routes/status');


var app = express();

// app.set('views', path.join(__dirname, 'routes'));
// app.set('view engine', 'marko');
// app.set('view engine', 'html');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/info/:id', routes);
app.use('/evaluate', evaluate);
app.use('/status', status);

for(var i = 0; i < plugins.length; i++){

    var moduleIndex = __dirname + '/engines/plugins/'+plugins[i].key+'/routes/index/index.js';
    if(fs.existsSync(moduleIndex)) {
        var pluginsPath = require(moduleIndex) || {};
        app.use('/plugins/'+plugins[i].key, pluginsPath);
        console.log(colors.green('Registering routes for plugin ' + plugins[i].key));
        allActivePlugin.push(plugins[i].key);
    }else{
        console.log(colors.red('Error : ', plugins[i].key + ' : ', 'No Routes found for the plugin'));
        process.exit(1);
    }

    // allActivePlugin.push('Test');
}

cache.set('allActivePlugin', allActivePlugin);

// init.initial();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// if (app.get('env') === 'development') {
//     console.log('Development environemnt');
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

job.start();

module.exports = app;
