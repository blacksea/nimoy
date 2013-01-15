
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
}(window));