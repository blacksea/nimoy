// S L E E P  W A L K E R 
// V.0 _ AG

// DEPENDANCIES
var osc       = require('node-osc');
var connect   = require('connect');
var templayed = require('templayed');
var midi      = require('midi');
var path      = require('path');
var http      = require('http');
var io        = require('socket.io');
var redis     = require('redis'),
client        = redis.createClient();

// LOCAL MODULES
var iron = require('./_iron.js');
var make = require('./_make.js');
make.set({ 
	public : './public',
	source : './mods',
	css    : './public/js',
	js     : './public/css'	
});
var bus = require('./_bus.js');
var mono = require('./mods/mono/monoServer.js'); // dynamically load server modules

// CORE 
// init iron
// init bus

// handle construction of server modules
make.done = function () {
	console.log('make complete!!!!');
}

make.rootDir = './mods';

var app = connect()
.use(connect.logger('dev'))
.use(connect.static('public'))
, server = require('http').createServer(app)
, io = io.listen(server);

var portMonomeIn = 8000;
var portMonomeOut = 8080;
var portLiveIn = 7777;
var portLiveOut = 9999;

var midiOut   = new midi.output();
var monomeIn  = new osc.Server(portMonomeIn, '127.0.0.1');
var monomeOut = new osc.Client('127.0.0.1', portMonomeOut);
var liveIn    = new osc.Server(portLiveIn, '127.0.0.1');
var liveOut   = new osc.Client('127.0.0.1', portLiveOut);

midiOut.openVirtualPort("monome");

function scale(val, oldMin, oldMax, newMin, newMax) {
	var oldRange = oldMax - oldMin;
	var newRange = newMax - newMin;
	var newVal = parseFloat(((val-oldMin)*newRange)/oldRange) + parseFloat(newMin);
	return newVal;
}

var rows = [];
var presets = [];

monomeIn.on("message", function (data) {
	rows[data[2]].hit(data[1], data[3]);
	monomeOut.send('/node/led', data[1], data[2], data[3]);
});

var touchParam = 'butter';

liveIn.on('message', function (data) {

	var param = data[0];

	function updateRow(data) {
		var rowId = data[1];
		var min = data[2];
		var max = data[3];
		var velocity = data[4];
		rows[rowId].scale(min,max,velocity);
		var txt = data[1]+' > '+ data[2]+' < '+ data[3]+' v '+data[4];
		liveOut.send('/console', txt);
	}
	function filterOSC(data) {
		if(touchParam!=data[1]){
			touchParam = data[1];
		}
		client.get(touchParam, function (err, result) {
			if(result != null){
				liveOut.send('/toCircle', result, data[2]);
			}
		});	
	}
	function newOSCfilter(data) {
		client.set(touchParam, data[1]);
	}
	function updateMenu() {
		liveOut.send('/setMenu', 'clear');
		client.llen('presets', function (err, len) {
			client.lrange('presets', 0, len, function (err, allPresets) {
				for(var i=0;i<allPresets.length;i++){
					liveOut.send('/setMenu', 'append '+allPresets[i]);
				}
			});
		});
	}
	function presetSave(presetName) {
		client.lpush('presets',presetName);
		var obj = {};
		for(var i=0;i<rows.length;i++){
			var id = 'row'+i;
			obj[id] = rows[i].getData();
		}
		var json = JSON.stringify(obj);
		client.set(presetName, json);
		updateMenu();
	}
	function presetLoad(presetName) {
		client.get(presetName, function (err, result){
			var obj = JSON.parse(result);
			var o = 0;
			for(var row in obj) {
				if(obj.hasOwnProperty(row)){
					rows[0].load(obj[row]);
					liveOut.send('/setRow', o, obj[row].min, obj[row].max, obj[row].vel);
				}
				o++;
			}
		});
	}

	switch(param) {
		case '/setRow' : updateRow(data);break; 
		case '/setParamIN' : filterOSC(data);break;
		case '/setParamOUT' : newOSCfilter(data);break;
		case '/save' : presetSave(data[1]);break;
		case '/update' : updateMenu();break;
		case '/load' : presetLoad(data[1]);break;
	}

});

var cmd = function () {};

cmd.do = function (action) {
	console.log('the command ' + action);
}

io.sockets.on('connection', function (socket) {
	socket.on('cmd', function (msg) {
		cmd.do(msg);		
	});
});

server.listen(80, '127.0.0.1');