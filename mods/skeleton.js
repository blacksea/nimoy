
// S K E L E T O N

(function (window) {

	var Skeleton = function () {
		var skel = this;

		//-----------------------------------------------------	
		//  L A Y O U T

		skel.init = function () {
			var panel = ui.create( 'panel', {
				name: 'skeleton',
				bind: [{in:['skeleton','move']},
				{out:['skeleton','state']}],
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
			console.log(cmd);
			console.log(bus.send);
			bus.send(['iron','interpret','skeleton','interpret',cmd]);
		}

		skel.state = function (pos) {
			console.log(pos);
			bus.send(['iron','recHistory','skeleton','move',pos]);
		}
	}

	window.skeleton = Skeleton;
}(window));