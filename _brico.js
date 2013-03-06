//BRICOLEUR 

var _ = Object._
, MuxDemux = require('mux-demux')
, Stream = require('stream')
, async = require('async');

module.exports = function (opts) {
  var self = this;

  this.Stream = MuxDemux();
  
  this.HandleData = function (dataObj) {
   self.objMap.push(dataObj);
  }

  this.Conn = function (state, input, output) { // handle connections
    if (state==='disconnect') _[output].output.unpipe(_[input].input);
    if (state==='connect') _[output].output.pipe(_[input].input);
  } 

  this.AddMod = function (module, cb) {
    if (opts.scope==='client') module.filepath = module.id;
    _[module.id.toUpperCase()] = require(module.filepath);
    _[module.id] = new _[module.id.toUpperCase()]();
    if (module.html) _[module.id].template = module.html;
    cb();
  } 

  this.DelMod = function (module, cb) {
  }

  // CLIENT / SERVER BRICO COMMUNICATION
  this.Stream.on('connection', function (stream) { 
    stream.on('data', function (data) { // hook / pipe stream from here
      if(stream.meta === 'brico') { // !?! call fn in this scope
        self[data[0]](data[1]);
       }
    });
  });

}
