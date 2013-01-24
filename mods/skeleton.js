
// S K E L E T O N

(function (window) {

	var Skeleton = function (template) {

		var skel = this;
		skel.template = template;

		skel.init = function () {
			var panel = ui.create( 'panel', {
				name: 'skeleton',
				insert: {
					txtInput: { 
						out: ['skeleton', 'interpret']},
					log: {
						in: ['skeleton', 'log']}
				}
			});
			panel.render();
		}

		skel.interpret = function (cmd) {
			console.log('+++ '+cmd);
			// bus.send(['iron','interpret','Waffle','loadModule',cmd]);
		}
	}

	window.skeleton = Skeleton;
}(window));