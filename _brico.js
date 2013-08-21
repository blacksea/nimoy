var stream = require('stream')
, inherits = require('inherits')

function Bricoleur (opts) { 
  if (!(this instanceof Bricoleur)) return new Bricoleur(opts)
  stream.Stream.call(this)
  if (!opts) opts = {}
  this.readable = true
  this.writable = true
  this._buffer = []

  var self = this
  , MAP = null
  , ENV = {}
  , _ = {} // module scope

  this._read = function (size) {} // !?!
  this.end = function () {}

  this.write  = function (chunk) {
    var d = JSON.parse(chunk.toString())
    if (d.r&&d.v) handleRoute(d)
    if (d.cmd&&d.val) self[d.cmd](d.val) // point cmd to internal function 
  }

  function handleRoute (d) {
    switch (d.r) {
      case 'key' : self.ID = d.v; console.log(self.ID);break;
      default : console.error('route not recognized');break;
    } 
  }

  this.make = function (mod) {
    if (process.browser&&mod.html){
      var m = require(mod.id.toUpperCase())
      _[mod.id] = new m(mod.html)
    }
  }

  this.conn = function (conns) {
    conns.forEach(function handleConnection (conn) {
      if (conn.match(/\+/)!==null) {
        var modA = conn.split('+')[0]
        , modB = conn.split('+')[1]
        _[modA].pipe(_[modB])
      }
      if (conn.match(/\-/)!==null) {
        var modA = conn.split('-')[0]
        , modB = conn.split('-')[1]
        modA.unpipe(modB)
      }
    })
  }

  this.unmake = function (mod) {
    if (process.browser) mod.destroy()
  }

  this.addConnection = function (key, cb) { // user socket connection
    self[key] = new stream.Duplex
    self[key]._read = function (size) {}
    self[key]._write = function (chunk,enc,next) {
      self.write(chunk)
      next()
    }
    var s = self[key]
    s.id = key
    cb()
  }

  this.removeConnection = function (key) {
    self[key].emit('close')
    delete self[key]
  } 
}

inherits(Bricoleur, stream.Stream)
module.exports = Bricoleur
