
// W A F F L E

(function (window) {
 
	var Waffle = function () {}

	Waffle.serve = function (default_modules) {
		console.log(default_modules);
		for(var i=0;i<default_modules.length;i++){
			var module = default_modules[i];
			console.log(module);
			window[module] = new window[module]();
			window[module].init();
			console.log(window[module]);
		}
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
