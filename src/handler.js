'use strict'

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

myEmitter.on('cscds', function(id){
    console.log('Event Handler Fired for : ', id);
});

module.exports = myEmitter;
