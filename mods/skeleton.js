
// S K E L E T O N

(function (window) {

	var Skeleton = function () {
		var skel = this;

		//-----------------------------------------------------	
		//  L A Y O U T

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

		//-----------------------------------------------------	
		//  E V E N T S

		skel.interpret = function (cmd) {
			skeleton.log(cmd);
		}
	}

	window.skeleton = Skeleton;
}(window));