//BRICOLEUR 

var _ = Object._
, MuxDemux = require('mux-demux')
, Stream = require('stream')
, async = require('async');

module.exports = function (dir) {
  var self = this;
  this.objMap = [];
  this.stream = MuxDemux();
  
  this.handleData = function (dataObj) {
   self.objMap.push(dataObj);
  }

  this.loaded = function () {
    console.dir(self.objMap);
  }

  this.addModule = function (module, cb) {
    _[module.id.toUpperCase()] = require(module.filepath);
    _[module.id] = new _[module.id.toUpperCase()]();
    cb();
  }

  this.connect = function (input, output) { 
    _[output].output.pipe(_[input].input);
  } 

  this.disconnect = function (input, output) {
    _[output].output.unpipe(_[input].input);
  }

  this.stream.on('connection', function (stream) {
    stream.on('data', function (data) { // hook / pipe stream from here
      if(stream.meta === 'brico') { // !?! call fn in this scope
        self[data[0]](data[1]);
       }
    });
  });
  
}
