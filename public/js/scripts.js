
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
			insert : {value : ['test','t2']}
			// bind : {value : ['mono', 'set']},
			// should accept a simple layout description
			// layout : {value : { 
			// 	// aef
			// }}
		}); 
		console.log('ins = '+panel.insert);
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

// S K E L E T O N

(function (window) {
	var Skeleton = function (template) {

		var skel = this;
		skel.template = template;

		skel.init = function () {
			var panel = ui.create( 'panel', {
				name : 'skeleton',
				insert : [['txtInput', {
					out : ['skel','interpret']
				}],['console']]
				// io : []
			});
			panel.render();
		}

		skel.interpret = function (cmd) {
			console.log('xxxx '+cmd);
			// bus.send(['iron','interpret','Waffle','loadModule',cmd]);
		}
	}

	window.skeleton = Skeleton;
}(window));
// U I  K I T

(function (window) {
	var UI = {

		create : function (component, settings) {
			var options = {}
			for(property in settings){
				options[property] = {value: settings[property]}
			}
			var newObj = Object.create(this[component], options);
			return newObj;
		},

		// ----------------------------------------------------
		//  C O M P O N E N T S
		// ----------------------------------------------------

		//-----------------------------------------------------	
		//  P A N E L

		panel : {

			// template : ui.templates.panel,

			render : function () {

				var container = document.createElement('div')
				, offset_x    = 0
				, offset_y    = 0;
				
				container.setAttribute('id', this.name);
				container.innerHTML = this.template;
				document.body.appendChild(container);
				
				var panel = container.querySelector('.panel');

				panel.ondragstart = function (e) {
					offset_x = e.clientX - panel.offsetLeft;
					offset_y = e.clientY - panel.offsetTop;
				}
			
				panel.ondrag = function (e) {
					panel.style.left = (e.clientX-offset_x)+'px';
					panel.style.top = (e.clientY-offset_y)+'px';
				}

				panel.ondragend = function (e) {
					e.preventDefault();
				}

				if(this.insert){
					var components = this.insert;
					for(var i=0;i<components.length;i++){
						var component = components[i];
						console.log(component);
					}
				}
			}
		},

		//-----------------------------------------------------
		//  T X T  I N P U T

		txtInput : {

			// allow for insertion / grouping

			render : function () {
			
				var input = document.getElementById('cmd');
				cmd.onsubmit = function (e) {
					e.preventDefault();
					var input = document.getElementById('prompt'),
					prompt = e.target.prompt.value;
					input.value = '';
					input.blur();
					this.output(prompt);
				}	
			}
		},

		//-----------------------------------------------------
		//  N U M  B O X

		numBox : {

			render : function () {
			
				var num = box.querySelector('.number');
				num.onmousewheel = function (event) {
					var oldVal = parseInt(this.innerHTML)
					, value = event.wheelDeltaY
					, newVal = null;
					if(value<0){
						newVal = oldVal+Math.abs(value);
					}else{
						newVal = oldVal-Math.abs(value);
					}
				}
			}
		}
	}
	window.ui = UI;
}(window));
 ui.templates = "
<panel>
	<div class='panel'>
		<div class='bar'>
			text
		</div>	
	</div>
</panel>

<number>
	<div class='number'>
	</div>
</number>
";