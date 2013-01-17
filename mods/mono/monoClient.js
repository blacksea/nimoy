//-------------------------------------------------
// 	m o n o m e
//-------------------------------------------------
(function (window) {
	var Monome = function (template) {
		var monome = this;
		//---------------------------------------------
		// L A Y O U T
		//---------------------------------------------
		var panel = Object.create(UI_Panel, {
			name : {value : 'monome'}, 
			// bind : {value : ['mono', 'set']},
			// should accept a simple layout description
			// layout : {value : { 
			// 	// aef
			// }}
		}); 
		console.log(panel);
		panel.render();
		// (function(){
			// generate
		// });
		//---------------------------------------------
		// E V E N T S
		//---------------------------------------------
		monome.set = function (row, min, max, vel) {
			bus.send(['mono','set','skeleton','log',[row,min,max,vel]]);
		}		
	}
	window.mono = Monome;
}(window));