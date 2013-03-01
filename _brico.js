// BRICOLEUR 

var _ = Object._
, MuxDemux = require('mux-demux')
, async = require('async');

module.exports = function (dir) {
  var self = this;
  this.init = function (map) { // an array of objs 
    async.forEach(map, self.addModule, function () {
      console.log('modules added');
    });
  }
  this.addModule = function (module, cb) {
    _[module.id.toUpperCase()] = require(module.filepath);
    _[module.id] = new _[module.id.toUpperCase()]();
    cb();
  }
  this.stream = MuxDemux();
  this.stream.on('connection', function (stream) {
    stream.on('data', function (data) { // hook / pipe stream from here
      if(stream.meta==='brico') { // call fn in this scope
        self[data[0]](data[1]);
       }
    });
  });
  // function to connect / disconnect | pipe / unpipe modules
  this.connect = function (input, output) {
    _[output].output.pipe(_[input].input);
  }
  // how to disconnect a stream ?
}
