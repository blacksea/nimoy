// c o m m a n d  m e n u 

(function (window) {
	var Menu = function () {
		var menu = this;
		menu.init = function () {
			var panel = ui.create( 'panel', {
				name: 'menu',
				bind: [{in:['menu','move']},
				{out:['menu','state']}],
				insert: {
					txtInput: { 
						bind: [{out:['menu','interpret']}]
					}
				}
			});
			panel.init();
		}
		menu.interpret = function (cmd) {
			bus.send(['iron','interpret','menu','interpret',cmd]);
		}
		menu.state = function (pos) {
			bus.send(['iron','recHistory','menu','move',pos]);
		}
	}
	window.menu = Menu;
}(window));