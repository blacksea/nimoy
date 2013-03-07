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

  this.AddMod = function (module) {
    _[module.id.toUpperCase()] = require(module.filepath);
    _[module.id] = new _[module.id.toUpperCase()]();
    if (module.html) _[module.id].template = module.html;
  } 

  this.DelMod = function (module) {
  }

  // CLIENT / SERVER BRICO COMMUNICATION
  this.Stream.on('connection', function (stream) { 
    stream.on('data', function (data) { 
      if(stream.meta === 'brico') { 
        console.log(data);
        self[data[0]](data[1]);
       }
    });
  });

}
