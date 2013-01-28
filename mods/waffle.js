
//  W A F F L E

(function (window) {
 
	var Waffle = function () {}
	
	//-----------------------------------------------------	
	//  E V E N T S

	Waffle.serve = function (modules) {
		for(var i=0;i<modules.length;i++){
			Waffle.loadModule(modules[i], function (module) {
				bus.send(['iron','playHistory','waffle','serve','fk']);
			});
		}
	}

	Waffle.loadModule = function (module, cb) {
		window[module] = new window[module]();
		window[module].init();
		cb(module);
	}
	
	window.Waffle = Waffle;
}(window));
