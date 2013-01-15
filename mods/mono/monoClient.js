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
		monome.render = function () {
			var html = templayed(monome.template)({test:''});
			var container = document.createElement('div');
			container.innerHTML = html;
			document.body.appendChild(container);
			container.onClick = function () {
				console.log('test click monome!!!');
			}
			monome.ready();
		}
		monome.ready = function () {
			console.log('monome ready!');
			var box = document.getElementById('monome')
			, num   = box.querySelector('.number')
			, offX  = 0
			, offY  = 0;
			box.ondragstart = function (event) {
				offX = event.clientX - box.offsetLeft;
				offY = event.clientY - box.offsetTop;
			}
			box.ondrag = function (event) {
				box.style.top = (event.clientY-offY)+'px';
				box.style.left = (event.clientX-offX)+'px';
			}
			box.ondragend = function (event) {
				event.preventDefault();
			}
			// grip.onmousedown = function () {
			// 	console.log('test click monome!!!');
			// }
			num.onmousewheel = function (event) {
				var value = event.wheelDeltaY;
				var oldVal = parseInt(this.innerHTML);
				var newVal = null;
				if(value<0){
					newVal = oldVal+Math.abs(value);
				}else{
					newVal = oldVal-Math.abs(value);
				}
				this.innerHTML = newVal;
			}
		}
	}
	window.mono = Monome;
}(window));