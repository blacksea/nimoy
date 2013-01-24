
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
						bind: [{out:['skeleton','interpret']}]
					},
					log: {
						bind: [{in:['skeleton','log']}]
					}
				}
			});
			panel.init();
		}

		skel.interpret = function (cmd) {
			skeleton.log(cmd);
		}
	}

	window.skeleton = Skeleton;
}(window));