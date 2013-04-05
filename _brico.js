// BRICOLEUR 

var _ = Object._ 
, MuxDemux = require('mux-demux')
, Stream = require('stream')
, async = require('async')

module.exports = function (opts) {
  
  var self = this

  this.HandleData = function (stream) {}
  
  this.AddMod = function (module, cb) {
    _[module.id.toUpperCase()] = require(module.filepath)
    _[module.id] = new _[module.id.toUpperCase()]()
    if (module.html) _[module.id].template = module.html
    if (_[module.id].init) _[module.id].init()
    cb()
  } 

  this.DelMod = function (module, cb) {
  }

  this.Conn = function (state, input, output) { // handle module connections
    if (state === 'disconnect') _[output].output.unpipe(_[input].input)
    if (state === 'connect') _[output].output.pipe(_[input].input)
  } 

}
