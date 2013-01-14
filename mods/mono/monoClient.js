
// m o n o m e

(function (window) {
	var Monome = function (template) {
		var m = this;
		m.template = template;

		m.init = function () {
			m.render();
			skeleton.log('monom ready!!!');
		}

		m.render = function () {
			var html = templayed(m.template)({test:''});
			var container = document.createElement('div');
			container.innerHTML = html;
			document.body.appendChild(container);
			m.ready();
		}
		
		m.ready = function () {
		}
	
	}
	window.mono = Monome;
}(window));