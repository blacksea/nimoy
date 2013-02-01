
// S E R V E R  B U S

var events = require('events');
var eventEmitter = new events.EventEmitter;
var Bus = function () {
	var bus = this;	
	bus.handleConnection = function (socket) {
		socket.on('*', function (paramArray) {
			var module     = paramArray[0]
			, method       = paramArray[1]
			, senderModule = paramArray[2]
			, senderMethod = paramArray[3]
			, args         = paramArray[4]; 
			global[module][method]([senderModule, senderMethod, args], function (paramArray) {
				socket.emit('*', paramArray);
			});
		});
		eventEmitter.on('&', function (paramArray) {
			socket.emit('*', paramArray);
		});
	}	
	bus.sendGlobal = function (paramArray) {
		eventEmitter.emit('&', paramArray);
	}
}
var bus = new Bus();
exports = module.exports = bus;