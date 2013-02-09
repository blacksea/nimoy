/* S H E L L
environment layer
shell accepts a mulitplex stream in and out	
shell runs on server or client
*/

var MuxDemux = require('mux-demux');

module.exports = function () {
  var self = this;
  self.bus = MuxDemux();
  self.bus.on('connection', function (stream) { // send an event on ready
    stream.on('data', function (data) {
      console.log(stream.meta + ' ' +data);
    });
  });
  self.Stream = function (stream) {
    self.bus.pipe(stream).pipe(self.bus);		
	}
	self.createChannel = function (conn) {
    // create streams here
    var channel = 'x';
    var s = self.bus.createStream(channel);
	}
	self.addModule = function (component) {
	}
	self.removeModule = function (component) {
	}
}

