
// W A F F L E

(function (window) {
 
	var Waffle = function () {}

	Waffle.serve = function () {
		window['bus'] = new Bus();
		console.log('requesting templates');
		bus.send(['iron','interpret','Waffle','loadModule','/ skeleton']);
	}

	Waffle.loadModule = function (paramArray) {
		console.log('unpacking...');
		var module = paramArray[0]
		, template = paramArray[1];
		console.log('unpacked');
		window[module] = new window[module](template);
		window[module].init();
		skeleton.log('loaded module '+module);
	}

	Waffle.cmd = function (cmd) {
		skeleton.log(cmd);
		console.log('got command, it is : '+cmd);
	}

	window.Waffle = Waffle;
}(window));