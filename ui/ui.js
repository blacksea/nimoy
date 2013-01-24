
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

		render : function (container, html, cb) {
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

				if(this.insert) { // create panel ui
					var components = this.insert;
					for(component in components) {
						console.log(components[component]);
						var cmp = ui.create(component, components[component]);
						console.log(this.name);
						cmp.render(this.name);
					}
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

			init : function (element) {
				var p = this;
				ui.render('skeleton', ui.template('txtInput'), function () {
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
			init : function (element) {
				var p = this;
				ui.render('skeleton', ui.template('log'), function () {
					var txt = this;
					var cmd = document.getElementById('cmd');
				});
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
			}
		}

	}
	window.ui = UI;
}(window));