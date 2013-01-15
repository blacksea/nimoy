// S E R V E R  B U S
var Bus = function () {
	var bus = this;	
	// make this smarter so it can push updates to clients
	bus.handleConnection = function (socket) {
		socket.on('*', function (paramArray) {
			var module     = paramArray[0]
			, method       = paramArray[1]
			, senderModule = paramArray[2]
			, senderMethod = paramArray[3]
			, args         = paramArray[4]; // msgpacked object
			
			global[module][method]([senderModule, senderMethod, args], function (paramArray) {
				socket.emit('*', paramArray);
			});
		});
	}	
}
var bus = new Bus();
exports = module.exports = bus;