
// U I  K I T

// editor module bulk prints elements
//---------------------------------------------
// T E M P L A T E  M A R K U P 
//---------------------------------------------
// var templates = document.createElement('div');
// templates.innerHTML = ui.template;
// ui.getComponent = function (component) {
// 	var elements = templates.getElementsByTagName(component);
// 	return elements[0].innerHTML; 
// }	
//---------------------------------------------
// P A N E L
//---------------------------------------------
var UI_Panel = {
	// name gets set during construction
	name : 'untitled',
	// panel gets template from db
	markup : '',
	// render takes template assembles and adds to dom
	render : function () {
	},
	// bind actions on dom elements to owner functions
	ready : function () {
	}
}
//---------------------------------------------
// M I C R O  P A N E L
//---------------------------------------------
//---------------------------------------------
// N U M B E R  B O X
//---------------------------------------------
var UI_NumberBox = {
	// name gets set during construction
	name : 'untitled',
	// panel gets template from db
	markup : '',
	// render takes template assembles and adds to dom
	render : function () {

	},
	// bind actions on dom elements to owner functions
	ready : function () {
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
	}
}