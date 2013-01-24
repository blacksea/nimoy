
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
			console.log('+++ '+cmd);
			skeleton.log(cmd);
			// bus.send(['iron','interpret','Waffle','loadModule',cmd]);
		}
	}

	window.skeleton = Skeleton;
}(window));
// U S E R   I N T E R F A C E

(function (window) {
	var UI = {

		// ----------------------------------------------------
		//  H E L P E R S
		// ----------------------------------------------------

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

		render : function (container, html, cb) {
			var container = document.getElementById(container)
			, tmp         = document.createElement('div');
			tmp.innerHTML = html;
	    while (tmp.firstChild) container.appendChild(tmp.firstChild);
			cb();
		},

		bind : function (paramArray, obj) {
			for(var i=0;i<paramArray.length;i++){
				var binding = paramArray[i];
				if(binding.out){
					obj.output = window[binding.out[0]][binding.out[1]];
				}
				if(binding.in){
					window[binding.in[0]][binding.in[1]]=obj.input;
				}
			}
		},

		// ----------------------------------------------------
		//  C O M P O N E N T S
		// ----------------------------------------------------

		//-----------------------------------------------------	
		//  P A N E L

		panel : {
			init : function () {		
				var p = this;
				ui.render('container', ui.template('panel'), function () {
				
					var offset_x = 0
					, offset_y   = 0;
					
					var panel = container.querySelector('.panel');
					panel.setAttribute('id', p.name);
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

					if(p.insert) { // create panel ui
						var components = p.insert;
						for(component in components) {
							var cmp = ui.create(component, components[component]);
							cmp.init(p.name);
						}
					}
				});
			}
		},

		//-----------------------------------------------------
		//  T X T  I N P U T
		
		txtInput : {
			init : function (element) {
				var p = this;
				ui.render('skeleton', ui.template('txtInput'), function () {
				
					if (p.bind) ui.bind(p.bind, p);
				
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
			init : function (element) {
				var p = this;
				ui.render('skeleton', ui.template('log'), function () {
					if (p.bind) ui.bind(p.bind, p);
				});
			},
			input : function (msg) {
				var date = new Date(),
				time = date.toLocaleTimeString().split(' ')[0],
				log = document.getElementById('console');
				console.log(time);
				log.innerHTML += '<span>'+time+'</span>'+msg+'<br>';
			}
		},
	
		//-----------------------------------------------------
		//  N U M  B O X

		numBox : {
			init : function (element) {
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
				if (this.bind) ui.bind(this.bind);
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