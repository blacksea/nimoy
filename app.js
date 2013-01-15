// S L E E P  W A L K E R  v.0 ag

var iron  = require('./_iron.js')
, bus  		= require('./_bus.js')
, connect = require('connect')
, http    = require('http')
, io      = require('socket.io');

var app = connect()
.use(connect.logger('dev'))
.use(connect.compress())
.use(connect.static('public'))
.use(iron.createFrame) // handle all requests with waffle iron 
, server = require('http').createServer(app)
, io = io.listen(server);

// patch socket.io into bus
io.sockets.on('connection', bus.handleConnection); 

iron.buildRegistry(function () { // clean this
	iron.buildFrame(function(){});
	iron.buildHTML(function(){});
	iron.buildCSS(function(){});
	iron.buildJS(function(){});
});

// server.listen(80,'204.27.60.58');
server.listen(8888);