
// M O N O M E

(function (window) {
	
	var Monome = function () {
		var monome = this;
	
		//-----------------------------------------------------	
		//  L A Y O U T

		monome.init = function () {
			var panel = ui.create( 'panel', {
				name: 'monome',
				insert: {
					txtInput: { 
						bind: [{out:['monome','out']}]
					},
					log: {
						bind: [{in:['monome','in']}]
					}
				}
			});
			panel.init();
		}

		//-----------------------------------------------------	
		//  E V E N T S

		monome.out = function (row, min, max, vel) {
			bus.send(['mono','set','skeleton','log',[row,min,max,vel]]);
		}		
	}

	window.mono = Monome;
}(window));