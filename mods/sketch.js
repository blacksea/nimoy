// S K E T C H

(function (window) {
	var Sketch = function () {
		var sketch = this;
		sketch.init = function (params) {
			console.log('init sketch');
			var cvs = ui.create( 'sketch', {
				name: 'sketch',
				width: '100%',
				height: '100%'});
			cvs.init('container');
			// handle ad hoc script loading ? just this module needs three.js
		}
	}
	window.sketch = Sketch;
}(window));
