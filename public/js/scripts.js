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
			insert : {value : ['test','t2']}
			// bind : {value : ['mono', 'set']},
			// should accept a simple layout description
			// layout : {value : { 
			// 	// aef
			// }}
		}); 
		console.log('ins = '+panel.insert);
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

		var skel = this;
		skel.template = template;

		skel.init = function () {
			// make a new panel
			var panel = Object.create(UI_Panel, {set: {
				enumerable: true, value: 
				{ 
					name : 'skeleton',
					insert : ['UI_TextInput'],
					io : ['skeleton', 'interpret']
				}

			}}); 
			
			panel.render();
		}

		skel.interpret = function (cmd) {
			console.log('xxxx '+cmd);
			// bus.send(['iron','interpret','Waffle','loadModule',cmd]);
		}
	}
	window.skeleton = Skeleton;
}(window));// U I  K I T

// editor module bulk prints elements

//---------------------------------------------
// T E M P L A T E  M A R K U P 
//---------------------------------------------

//---------------------------------------------
// P A N E L
//---------------------------------------------
var UI_Panel = {

	name : 'untitled',
	
	template : '<div class="panel"></div>',

	insert : null,
	
	render : function () { // render takes template assembles and adds to dom

		this.name = this.set.name;

		if(this.set.insert) {
			var components = this.set.insert;
			for(var i=0;i<components.length;i++) {
				var obj = window[components[i]];
				var newObj = Object.create(obj, {set: {
					enumerable: true, value:
					{
						name: 'cmd',
						io : ['skeleton', 'interpret']
					}
				}});
				newObj.send('test');
			}
		}

		console.log('xxxx');
		console.log(window[this.set.io[0]]);
		
		var container = document.createElement('div')
		, offset_x    = 0
		, offset_y    = 0;
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

	},

	send : function (params) {
		var module = params[0]
		, method   = params[1];
		window[module][method](params[2]);
	}

}
//---------------------------------------------
// T E X T  I N P U T
//---------------------------------------------
var UI_TextInput = {

	template : '',

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
	},

	send : function (params) {
		var module = this.set.io[0]
		, method   = this.set.io[1];
		window[module][method](params);
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