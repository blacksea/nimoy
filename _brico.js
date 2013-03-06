//BRICOLEUR 

var _ = Object._ // module scope
, MuxDemux = require('mux-demux')
, Stream = require('stream')
, async = require('async');

module.exports = function (opts) {
  /*
   opts.deps = (array) base modules to load 
   opts.scope (string) 'client' or 'server'
  */

  var self = this;

  this.Stream = MuxDemux();
  
  this.HandleData = function (dataObj) {
   // self.objMap.push(dataObj);
  }

  this.Conn = function (state, input, output) { // handle module connections
    if (state==='disconnect') _[output].output.unpipe(_[input].input);
    if (state==='connect') _[output].output.pipe(_[input].input);
  } 

  this.addMod = function (module, cb) {
    if (opts.scope==='client') module.filepath = module.id; // client side require should be name not path
    _[module.id.toUpperCase()] = require(module.filepath);
    _[module.id] = new _[module.id.toUpperCase()]();
    if (module.html) _[module.id].template = module.html;
    cb();
  } 

  this.DelMod = function (module, cb) {
  }

  // CLIENT / SERVER BRICO COMMUNICATION
  this.Stream.on('connection', function (stream) { 
    stream.on('data', function (data) { 
      if(stream.meta === 'brico') { 
        console.dir(data);
        self[data[0]](data[1]);
       }
    });
  });

}
