var osc = require('node-osc');
var midi = require('midi');
var express = require('express');
var path = require('path');
var http = require('http');
var io = require('socket.io');
var redis = require("redis"),
client = redis.createClient();

var app = express()
, server = require('http').createServer(app)
, io = io.listen(server);

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, '/public')));
});

app.get('/', function (req,res) {
	res.render('index');
});

var portMonomeIn = 8000;
var portMonomeOut = 8080;
var portLiveIn = 7777;
var portLiveOut = 9999;

var midiOut = new midi.output();
var monomeIn = new osc.Server(portMonomeIn, '127.0.0.1');
var monomeOut = new osc.Client('127.0.0.1', portMonomeOut);
var liveIn = new osc.Server(portLiveIn, '127.0.0.1');
var liveOut = new osc.Client('127.0.0.1', portLiveOut);

midiOut.openVirtualPort("monome");

function scale(val, oldMin, oldMax, newMin, newMax) {
	var oldRange = oldMax - oldMin;
	var newRange = newMax - newMin;
	var newVal = parseFloat(((val-oldMin)*newRange)/oldRange) + parseFloat(newMin);
	return newVal;
}

var rows = [];
var presets = [];

var Row = function (id) {
	var r = this;
	
	r.json = {
		min:0,
		max:127,
		vel:127
	};

	function scaleOnOff(val) {
		if(val==1){
			return r.json.vel;
		} else {
			return val;
		}
	}

	r.getData = function () {
		return r.json;
	}

	r.load = function (dataObj) {
		r.json.min = dataObj.min;
		r.json.max = dataObj.max;
		r.json.vel = dataObj.vel;
	}
	
	r.scale = function (min, max, velocity) {
		midiOut.sendMessage([144,r.lastNote,0]);
		r.json.min = min;
		r.json.max = max;
		r.json.vel = velocity;
	}

	r.hit = function (note, noteVal) {
		var noteScaled = Math.round(scale(note, 0, 7, r.json.min, r.json.max));
		r.lastNote = noteScaled;
		midiOut.sendMessage([144,noteScaled,scaleOnOff(noteVal)]);
	} 
}; 

for (var i=0;i<8;i++) { // make 8 rows & add to rows array
	var row = new Row(i);
	rows.push(row);
}

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
server.listen(3000);