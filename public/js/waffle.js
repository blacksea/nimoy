
// W A F F L E

(function (window) {
 
	var Waffle = function () {}

	Waffle.serve = function () {
		window['bus'] = new Bus();
		window['skeleton'] = new skeleton();
		skeleton.init();
		// bus.send(['iron','interpret','Waffle','loadModule','/ skeleton']);
	}

	Waffle.loadModule = function (paramArray) {
		var module = paramArray[0]
		, template = paramArray[1];
		window[module] = new window[module](template);
		window[module].init();
		skeleton.log('loaded module '+module);
	}
	
	window.Waffle = Waffle;
}(window));
