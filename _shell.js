/* S H E L L
shell is a layer for creating/destroying components
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
	self.Conn = function (conn) {
    // create streams here
    var channel = 'x';
    var s = self.bus.createStream(channel);
	}
	self.create = function (component) {
	}
	self.destroy = function (component) {
	}
}

