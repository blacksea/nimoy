
// S L E E P  W A L K E R  v.0 _ ag

var iron  = require('./_iron.js')
, bus  		= require('./_bus.js')
, connect = require('connect')
, http    = require('http')
, io      = require('socket.io');

var app = connect()
.use(connect.logger('dev'))
.use(connect.compress())
.use(connect.static('public'))
.use(iron.req) // handle all requests with waffle iron 
, server = require('http').createServer(app)
, io = io.listen(server);

iron.readJson(function () {
	iron.setup(function () {
		console.log('server ready!');
	});
});

// patch socket.io into bus
io.sockets.on('connection', bus.handleConnection); 

// server.listen(80,'204.27.60.58'); //live config
server.listen(8888); //dev config