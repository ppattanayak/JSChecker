#!/usr/bin/env node

/**
 * Module dependencies.
 */

require('./global');
var app = require('./app');
var debug = require('debug');
var http = require('http');
var emitter = require('./src/handler');
var colors = require('colors/safe');
var cache = require('./src/cache');

var config = cache.get('config');

var emitters = config.emitters;

emitter.on(emitters.fatalerror, function(sub, value){
    console.log(colors.red('Error : '+ sub+ ' - ' + value));
    process.exit(1);
});

// Object.keys(enginePlugins).forEach(function(key) {
//     console.log('================================== Key : ', key);
//     if(plugins[key].status === true){
//         require('./plugins/'+key);
//         console.log("++++++++++++++++++++++++++++++ Plugin Registered : ", key);
//     }
// });
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || config.app.server.port);
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
console.log('Server Started at ' + port);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
