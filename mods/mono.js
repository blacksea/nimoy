
// M O N O M E

var Mono = function (gridSize) {

	var monome = this;

	var midi    = require('midi')
	, maxRows   = Math.sqrt(gridSize)
	, rows      = []
	, oscPrefix = '/node/'
	, osc       = require('node-osc')
	, oscOut    = new osc.Client('127.0.0.1', 8080)
	, oscIn     = new osc.Server(8000, '127.0.0.1')
	, midiOut   = new midi.output();

	var presets = [];
	midiOut.openVirtualPort("monome");

	// list input / outputs somehow ? generated with row construction ?

	function scale(val, oldMin, oldMax, newMin, newMax) {
		var oldRange = oldMax - oldMin;
		var newRange = newMax - newMin;
		var newVal = parseFloat(((val-oldMin)*newRange)/oldRange) + parseFloat(newMin);
		return newVal;
	}

	var Row = function (id) {
		var row = this;
		row.settings = {
			id  : id,
			min : 0,
			max : 127,
			vel : 127
		}
		row.press = function (x,z) {
			var y = row.settings.id;
			if(z==1) z=row.settings.vel;
			oscOut.send(oscPrefix+'led',x,y,z);
			var noteScaled = Math.round(scale(x, 0, 7, row.settings.min, row.settings.max));
			midiOut.sendMessage([144,noteScaled,z]);
		}
	}

	oscOut.send(oscPrefix+'led',0,0,1);

	monome.init = function (size) {
		for (var i=0;i<size;i++) { // make 8 rows & add to rows array
			var row = new Row(i);
			rows.push(row);
		}
	}
	monome.set = function (paramArray, cb) {	
		var settings = paramArray[2];
		var r = settings[0];
		var msg = 'set monome row: '+r;
		rows[r].settings.min = settings[1]
		rows[r].settings.max = settings[2]
		rows[r].settings.vel = settings[3];
		cb(['skeleton','log', msg]);
	}
	monome.handleOSC = function (msg, rinfo) {
		var x = msg[1]
		, y   = msg[2]
		, z   = msg[3];
		rows[y].press(x,z);
	}
	monome.init(maxRows);
	oscIn.on("message", monome.handleOSC);
}
var mono = new Mono(64);
exports = module.exports = mono;