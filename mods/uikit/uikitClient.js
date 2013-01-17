
// U I  K I T

// editor module bulk prints elements
//---------------------------------------------
// T E M P L A T E  M A R K U P 
//---------------------------------------------
// patch in markup
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

	name : 'untitled',
	
	template : '<div class="panel"></div>',
	
	render : function () { // render takes template assembles and adds to dom
		var container = document.createElement('div'),
		offset_x = 0,
		offset_y = 0;
		container.setAttribute('id', this.name);
		container.innerHTML = this.template;
		document.body.appendChild(container);
		var panel = container.querySelector('.panel');
		panel.ondragstart = function (e) {
			offset_x = e.clientX - panel.offsetLeft;
			offset_y = e.clientY - panel.offsetTop;
		}
		panel.ondragend = function (e) {
			e.preventDefault();
		}
		panel.ondrag = function (e) {
			panel.style.left = (e.clientX-offset_x)+'px';
			panel.style.top = (e.clientY-offset_y)+'px';
		}
	}
	// layout : function (uiArray) {
	// 	for(var i=0;i<uiArray.length;i++) {
	// 		var ele = Object.create(uiArray[i],{
	// 			name:{value:uiArray[i]}
	// 		});

	// 	}
	// } 
}
//---------------------------------------------
// T E X T  I N P U T
//---------------------------------------------
var UI_textInput = {

	template : '',

	output : function (command) {
		console.log(command);
	},

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
}
//---------------------------------------------
// N U M B E R  B O X
//---------------------------------------------
var UI_NumberBox = {

	name : 'untitled',

	markup : '',

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
	},

	ready : function () {
	}
}