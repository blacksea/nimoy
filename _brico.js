// B R I C O L E U R 
var MuxDemux = require('mux-demux')
, async = require('async');

module.exports = function (dir) {
  var self = this;
  this.init = function (map, cb) { // an array of objs 
    async.forEach(map, self.addModule, function () {
      cb();
    });
  }
  this.addModule = function (module, cb) {
    self[module.id.toUpperCase()] = require(module.filepath);
    self[module.id] = new self[module.id.toUpperCase()]();
    cb();
  }
  ////////////////////////////////////////////////
  this.stream = MuxDemux();
  this.stream.on('connection', function (stream) {
    stream.on('data', function (data) { // hook / pipe stream from here
       console.log(stream.meta+' '+data);
    });
  /////////////////////////////////////////////////////////////////////
  });
}
