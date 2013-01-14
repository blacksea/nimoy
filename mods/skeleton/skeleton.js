
// s k e l e t o n

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
			var logger = document.getElementById('console');
			logger.innerHTML = msg;
		}
	
	}
	window.skeleton = Skeleton;
}(window));