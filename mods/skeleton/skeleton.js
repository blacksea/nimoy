// S K E L E T O N
(function (window) {
	var Skeleton = function (template) {
		console.log(template);
		var skel = this;
		skel.template = template;

		skel.init = function () {
		
			var panel = Object.create(UI_Panel, {
				name : {value : 'skel'},
				// bind : {value : ['mono', 'set']},
				// layout : {value : {
					
				// 	// aef
				// }
			}); 
			panel.render();
		
		}

		skel.interpret = function (cmd) {
			bus.send(['iron','interpret','Waffle','loadModule',cmd]);
		}
		// skel.log = function (msg) {
		// 	var date = new Date() 
		// 	, time   = date.toLocaleTimeString().split(' ')[0]
		// 	, logger = document.getElementById('console')
		// 	, txt    = logger.innerHTML;
		// 	logger.innerHTML = '<small>'+time+'</small>'+msg+'<br>'+txt;
		// }
	}
	window.skeleton = Skeleton;
}(window));