// C L I E N T  B U S

(function (window) {

	var Bus = function () {

		var bus = this;

		// var socket = io.connect("http://127.0.0.1:8888");
		var socket = io.connect("http://204.27.60.58");
		
		socket.on('*', function (paramArray) {
			var module     = paramArray[0]
			, method       = paramArray[1]
			, args         = paramArray[2]; // msgpacked object
			
			window[module][method](args);
		});

		bus.send = function (paramArray) {
			socket.emit('*', paramArray);
		}
		
	}

	window.Bus = Bus;
}(window));