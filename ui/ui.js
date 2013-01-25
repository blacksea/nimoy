
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
			init : function () {		
				var p = this;
				ui.render('container', ui.template('panel'), function () {
				
					var offset_x = 0
					, offset_y   = 0;

					var panel = document.querySelector('.panel')
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
						container.style.left = (e.clientX-offset_x)+'px';
						container.style.top = (e.clientY-offset_y)+'px';
					}
					function stopDrag () {
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