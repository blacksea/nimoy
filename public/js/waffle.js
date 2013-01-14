
// W A F F L E

(function (window) {
 
	var Waffle = function () {}

	Waffle.serve = function () {
		window['bus'] = new Bus();
		bus.send(['iron', 'sendTemplates', 'bus', 'spread']);	
	}

	Waffle.spread = function (obj) {
		var upakd = msgpack.unpack(obj);
		Waffle.templates = JSON.parse(upakd);
		for(module in Waffle.templates){
			if(module!='mono'){
				window[module] = new window[module](Waffle.templates[module]);
				window[module].init();
			}
		}
	}

	Waffle.loadModule = function (module) {
		skeleton.log('loading module '+module);
		window[module] = new window[module](Waffle.templates[module]);
		window[module].init();
	}

	Waffle.cmd = function (cmd) {
		skeleton.log(cmd);
		console.log('got command, it is : '+cmd);
	}

	window.Waffle = Waffle;
}(window));