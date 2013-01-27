var iron  = require('./_iron.js')
, bus  		= require('./_bus.js')
, connect = require('connect')
, http    = require('http')
, io      = require('socket.io');

var app = connect()
.use(connect.logger('dev'))
.use(connect.compress())
.use(connect.static('public'))
.use(iron.req)
, server = require('http').createServer(app)
, io = io.listen(server);

iron.readJson(function () {
	iron.setup(function () {
		console.log('server ready!');
	});
});

io.sockets.on('connection', bus.handleConnection); 

server.listen(8888);