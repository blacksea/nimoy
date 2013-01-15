
// m o n o m e

(function (window) {
	var Monome = function (template) {
		
		var monome = this;
		monome.template = template;
		// extend a basic uipanel construct new instance of panel 
		// and populate with needed elements
		monome.init = function () {
			monome.render();
		}
		monome.renderUI = function () {
			
		}
		// make nested micro panels with mapped interface / ui elements
		var panel = new Ui.panel({
		});
		// replace ui with uikit instances
		monome.ready = function () {
			var box = document.getElementById('monome')
			, num   = box.querySelector('.number')
			, offX  = 0
			, offY  = 0;
			box.ondragstart = function (event) {
				offX = event.clientX - box.offsetLeft;
				offY = event.clientY - box.offsetTop;
			}
			box.ondrag = function (event) {
				box.style.left = (event.clientX-offX)+'px';
				box.style.top = (event.clientY-offY)+'px';
			}
			box.ondragend = function (event) {
				event.preventDefault();
			}
		}
		// server interface
		monome.set = function (row, min, max, vel) {
			bus.send(['mono','set','skeleton','log',[row,min,max,vel]]);
		}
	}
	window.mono = Monome;
}(window));// S K E L E T O N
(function (window) {
	var Skeleton = function (template) {

		var skel = this;
		skel.template = template;

		skel.init = function () {
			skel.render();
		}
		skel.render = function () {
			var html = templayed(skel.template)({test:''});
			var container = document.createElement('div');
			container.innerHTML = html;
			document.body.appendChild(container);
			skel.ready();
		}
		skel.ready = function () {
			var cmd = document.getElementById('cmd');
			cmd.onsubmit = function (e) {
				e.preventDefault();
				var input = document.getElementById('prompt'),
				prompt = e.target.prompt.value;
				input.value = '';
				input.blur();
				skel.interpret(prompt);
			}		
		}
		skel.interpret = function (cmd) {
			bus.send(['iron','interpret','Waffle','loadModule',cmd]);
		}
		skel.log = function (msg) {
			var date = new Date() 
			, time   = date.toLocaleTimeString().split(' ')[0]
			, logger = document.getElementById('console')
			, txt    = logger.innerHTML;
			logger.innerHTML = '<small>'+time+'</small>'+msg+'<br>'+txt;
		}
	}
	window.skeleton = Skeleton;
}(window));
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