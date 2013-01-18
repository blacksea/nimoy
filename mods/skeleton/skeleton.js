// S K E L E T O N

(function (window) {
	var Skeleton = function (template) {

		var skel = this;
		skel.template = template;

		skel.init = function () {
			// make a new panel
			var panel = Object.create(UI_Panel, {set: {
				enumerable: true, value: 
				{ 
					name : 'skeleton',
					insert : ['UI_TextInput'],
					io : ['skeleton', 'interpret']
				}

			}}); 
			
			panel.render();
		}

		skel.interpret = function (cmd) {
			console.log('xxxx '+cmd);
			// bus.send(['iron','interpret','Waffle','loadModule',cmd]);
		}
	}
	window.skeleton = Skeleton;
}(window));