// C L I E N T  B U S

(function (window) {
	var Bus = function () {}
	var socket = io.connect("http://127.0.0.1:8888");
	socket.on('*', function (paramArray) { // local channel
		var module = paramArray[0]
		, method   = paramArray[1]
		, args     = paramArray[2];
		window[module][method](args);
	});
	Bus.send = function (paramArray) {
		socket.emit('*', paramArray);
	}
	window.bus = Bus;
}(window));