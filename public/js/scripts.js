

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

//  W A F F L E

(function (window) {
 
	var Waffle = function () {}
	
	//-----------------------------------------------------	
	//  E V E N T S

	Waffle.serve = function (modules) {
		for(var i=0;i<modules.length;i++){
			Waffle.loadModule(modules[i], function (module) {
				bus.send(['iron','playHistory','waffle','serve','fk']);
			});
		}
	}

	Waffle.loadModule = function (module, cb) {
		window[module] = new window[module]();
		window[module].init();
		cb(module);
	}
	
	window.Waffle = Waffle;
}(window));


// C L I E N T  B U S

(function (window) {

	var socket = io.connect("http://127.0.0.1:8888");

	socket.on('*', function (paramArray) {
		console.log(paramArray);
		var module = paramArray[0]
		, method   = paramArray[1]
		, args     = paramArray[2];
		window[module][method](args);
	});

	var Bus = function () {}

	Bus.send = function (paramArray) {
		socket.emit('*', paramArray);
	}

	window.bus = Bus;
}(window));
// U S E R   I N T E R F A C E   C L A S S

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

		bind : function (bindings, obj) {
			for(var i=0;i<bindings.length;i++){
				var binding = bindings[i];
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
			
			input : function (pos) {
				var panel = document.getElementById(pos[0]);
				panel.style.left = pos[1];
				panel.style.top = pos[2];
			},

			init : function () {		
				var p = this;
				ui.render('container', ui.template('panel'), function () {
				
					if (p.bind) ui.bind(p.bind, p);

					var offset_x = 0
					, offset_y   = 0
					, posX       = '0px'
					, posY       = '0px';

					var panel = document.getElementById('ui_panel')
					, group   = document.querySelector('.group');
					panel.setAttribute('id', p.name);
					group.setAttribute('id', p.name+'_group');
					
					var container = document.getElementById(p.name)
					, panel = container.querySelector('.grip');
					
					panel.onmousedown = function (e) {
						e.preventDefault();
						offset_x = e.clientX - container.offsetLeft;
						offset_y = e.clientY - container.offsetTop;
						window.addEventListener("mousemove", startDrag, false);
						document.body.style.cursor = 'move';
					}

					panel.onmouseup = function (e) {
						document.body.style.cursor = 'default';
						stopDrag();
						return false;
					}

					function startDrag (e) {
						posX = (e.clientX-offset_x)+'px'
						, posY   = (e.clientY-offset_y)+'px';
						container.style.left = posX;
						container.style.top = posY;
					}
					
					function stopDrag () {
						p.output([p.name, posX,posY]);
						window.removeEventListener("mousemove", startDrag, false);
					}

					if(p.insert) { // create panel ui
						var components = p.insert;
						for(component in components) {
							var cmp = ui.create(component, components[component]);
							cmp.init(p.name+'_group');
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
				ui.render(element, ui.template('txtInput'), function () {
				
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
				ui.render(element, ui.template('log'), function () {
					if (p.bind) ui.bind(p.bind, p);
				});
			},
			input : function (msg) {
				var date = new Date(),
				time = date.toLocaleTimeString().split(' ')[0],
				log = document.getElementById('console');
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
	<div id='ui_panel' class='panel'>
		<div class='group'>
		</div>
		<div class='grip'>
		</div>	
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