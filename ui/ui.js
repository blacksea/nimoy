
// U I 

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

		template : function (name) {
			var template = ui.templates.getElementsByTagName(name)[0];
			return template.innerHTML;
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
				
				container.setAttribute('id', this.name);
				container.innerHTML = ui.template('panel');
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
						var cmd = ui.create(component[0], component[1]);
						cmd.render('.panel');
					}
				}
			}
		},

		//-----------------------------------------------------
		//  T X T  I N P U T
		txtInput : {
			// groupable ... 
			// find parent?
			output : function (text) {
				console.log(this);
				var module = this.out[0]
				, method   = this.out[1];
				window[module][method](text);
			},

			render : function (element) {
				var txt = this;
				var container = document.querySelector(element);
				container.innerHTML += ui.template('txtinput');
				var input = document.getElementById('cmd');
				cmd.onsubmit = function (e) {
					e.preventDefault();
					var input = document.getElementById('prompt'),
					prompt = e.target.prompt.value;
					input.value = '';
					input.blur();
					txt.output(prompt);
				}	
			}
		},

		//-----------------------------------------------------
		//  L O G
		log : {
			render : function (element) {
				var container = document.querySelector(element);
				container.innerHTML += ui.template('log');
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