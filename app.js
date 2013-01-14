// S L E E P  W A L K E R 

// V.0 _ AG _
var iron  = require('./_iron.js')
, bus  		= require('./_bus.js')
, connect = require('connect')
, http    = require('http')
, io      = require('socket.io');

global['iron'] = iron;

var app = connect()
.use(connect.logger('dev'))
.use(connect.compress())
.use(connect.static('public'))
.use(iron.createFrame) // send requests to iron 
, server = require('http').createServer(app)
, io = io.listen(server);

// handle socket connection with bus
io.sockets.on('connection', bus.handleConnection); 

iron.buildRegistry(function () {
	console.log('registry built!');
	iron.buildFrame(function(){});
	iron.buildHTML(function(){});
	iron.buildJS(function(){});
	console.log(iron.settings.commands);
	// iron.buildCSS();
});


server.listen(8888);