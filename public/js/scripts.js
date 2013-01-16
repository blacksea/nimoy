//-------------------------------------------------
// 	m o n o m e
//-------------------------------------------------
(function (window) {
	var Monome = function (template) {
		var monome = this;
		//---------------------------------------------
		// L A Y O U T
		//---------------------------------------------
		var panel = Object.create(UI_Panel, {
			name : {value : 'monome'},
			// bind : {value : ['mono', 'set']},
			// layout : {value : {
			// 	// aef
			// }}
		}); 
		console.log(panel);
		panel.render();
		// (function(){
			// generate
		// });
		//---------------------------------------------
		// E V E N T S
		//---------------------------------------------
		monome.set = function (row, min, max, vel) {
			bus.send(['mono','set','skeleton','log',[row,min,max,vel]]);
		}		
	}
	window.mono = Monome;
}(window));// S K E L E T O N
(function (window) {
	var Skeleton = function (template) {
		console.log(template);
		var skel = this;
		skel.template = template;

		skel.init = function () {
		
			var panel = Object.create(UI_Panel, {
				name : {value : 'skel'},
				// bind : {value : ['mono', 'set']},
				// layout : {value : {
					
				// 	// aef
				// }
			}); 
			panel.render();
		
		}

		skel.interpret = function (cmd) {
			bus.send(['iron','interpret','Waffle','loadModule',cmd]);
		}
		// skel.log = function (msg) {
		// 	var date = new Date() 
		// 	, time   = date.toLocaleTimeString().split(' ')[0]
		// 	, logger = document.getElementById('console')
		// 	, txt    = logger.innerHTML;
		// 	logger.innerHTML = '<small>'+time+'</small>'+msg+'<br>'+txt;
		// }
	}
	window.skeleton = Skeleton;
}(window));
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
		panel.ondrag = function (e) {
			panel.style.left = (e.clientX-offset_x)+'px';
			panel.style.top = (e.clientY-offset_y)+'px';
		}
		panel.ondragend = function (e) {
			e.preventDefault();
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