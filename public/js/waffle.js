
// W A F F L E

(function (window) {
 
	var Waffle = function () {}

	Waffle.serve = function () {
		window['bus'] = new Bus();
		console.log('requesting templates');
		bus.send(['iron', 'sendTemplates', 'bus', 'spread']);	
	}

	Waffle.spread = function (obj) {
		console.log('got got templates');
		var upakd = msgpack.unpack(obj);
		console.log('unpacked templates')
		Waffle.templates = JSON.parse(upakd);
		for(module in Waffle.templates){
			if(window[module]){
				delete window[module];
			}
			if(module!='mono'){
				window[module] = new window[module](Waffle.templates[module]);
				window[module].init();
			}
		}
	}

	Waffle.loadModule = function (module) {
		if(window[module]){
			delete window[module];
		}
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