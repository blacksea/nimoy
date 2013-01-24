
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
				name   : 'skeleton',
				insert : {
					txtInput : {
						out : ['skeleton', 'interpret']
					},
					log : {

					}
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
// U I 

(function (window) {
	var UI = {

		create : function (component, settings) {
			var options = {}
			for(property in settings){
				options[property] = {value: settings[property]}
			}
			var newObj = Object.create(UI[component], options);
			return newObj;
		},

		template : function (name) {
			var template = ui.templates.getElementsByTagName(name)[0];
			return template.innerHTML;
		},

		append : function (container, html, cb) {
			var container = document.getElementById(container)
			, tmp         = document.createElement('div');
			tmp.innerHTML = html;
	    while (tmp.firstChild) container.appendChild(tmp.firstChild);
			cb();
		},

		// ----------------------------------------------------
		//  C O M P O N E N T S
		// ----------------------------------------------------

		//-----------------------------------------------------	
		//  P A N E L
		panel : {

			render : function () {
				var container = document.createElement('div')
				, offset_x    = 0
				, offset_y    = 0;
				
				container.innerHTML = ui.template('panel');
				document.body.appendChild(container);
				
				var panel = container.querySelector('.panel');
				panel.setAttribute('id', this.name);
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
					console.log(this.insert);

					var components = this.insert;
					
					for(component in components) {
						console.log(components[component]);
						var cmp = ui.create(component, components[component]);
						console.log(this.name);
						cmp.render(this.name);
					}
					// for(var i=0;i<components.length;i++){
					// 	var component = components[i];
					// 	var cmd = ui.create(component[0], component[1]);
					// 	cmd.render('.panel');
					// }

				}
			}
		},

		//-----------------------------------------------------
		//  T X T  I N P U T
		txtInput : {
			output : function (text) {
				var module = this.out[0]
				, method   = this.out[1];
				window[module][method](text);
			},

			render : function (element) {
				var p = this;
				ui.append('skeleton', ui.template('txtInput'), function () {
					var txt = this;
					var cmd = document.getElementById('cmd');
					cmd.onsubmit = function (e) {
						e.preventDefault();
						var input = document.getElementById('prompt'),
						prompt = e.target.prompt.value;
						input.value = '';
						input.blur();
						p.output(prompt);
					}	
				});
			}
		},

		//-----------------------------------------------------
		//  L O G
		log : {
			render : function (element) {
				var p = this;
				ui.append('skeleton', ui.template('log'), function () {
					var txt = this;
					var cmd = document.getElementById('cmd');
				});
			},
			input : function (msg) {

			}
		},
	
		//-----------------------------------------------------
		//  N U M  B O X
		numBox : {
			render : function (element) {
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
 ui.markup = "<panel>
	<div class='panel'>
	</div>
</panel>

<txtInput>
	<form id='cmd' action='/'>
		<input type='text' id='prompt' class='txtinput' name='prompt' autocomplete='off'></input>
		<input type='submit' style='display:none;'></input>
	</form>
</txtInput>

<number>
	<div class='number'>
	</div>
</number>

<log>
	<div id='console'></div>
</log>";
 ui.templates = document.createElement("div");
 ui.templates.innerHTML = ui.markup;