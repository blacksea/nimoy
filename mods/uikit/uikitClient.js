
// U I  K I T

// figure out how to do testing 
// finish this class

// -- shape shifter -- //
(function (window) {

	var Ui = function (template) {

		var ui = this;
		ui.template = template;
		// construct different components
		// events 
		// for sliders and numboxes
		num.onmousewheel = function (event) {
			var oldVal = parseInt(this.innerHTML)
			, value = event.wheelDeltaY
			, newVal = null;
			if(value<0){
				newVal = oldVal+Math.abs(value);
			}else{
				newVal = oldVal-Math.abs(value);
			}
			this.innerHTML = newVal;
		}
		// for draggable components / panels
		ondragstart = function () { 

		}
		ondragend = function () {
			
		}
		ondrag = function () {

		}
		// class to route to - // overide 
		// provide structure and assemble
		var templates = document.createElement('div');
		templates.innerHTML = ui.template;
		ui.init = function () {
			console.log(ui.getComponent('panel'));
		}
		ui.getComponent = function (component) {
			var elements = templates.getElementsByTagName(component);
			return elements[0].innerHTML; 
		}		
	}

	window.uikit = Ui;
}(window));