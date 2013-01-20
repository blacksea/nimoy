
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