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
  
  this.addSoc = function (key, cb) { // user socket connection
    self[key] = new stream.Duplex
    self[key]._read = function (size) {}
    self[key]._write = function (chunk,enc,next) { //add key to each obj
      var d = JSON.parse(chunk.toString())
      d.k = key
      self.recv(d)
      next()
    }
    var s = self[key]
    s.id = key
    cb()
  }

  this.rmSoc = function (key) {
    self[key].emit('close')
    delete self[key]
  } 

  this.send = function (d) {
    if (!d.k) console.error('no client id')
    if (d.k) self[d.k].emit('data', JSON.stringify(d))
  }
  this.recv = function (d) {
    if (d.r&&d.v) handleRoute(d)
    if (d.cmd&&d.val) self[d.cmd](d.val) // point cmd to internal function 
  }

  function handleRoute (d) {
      switch (d.r) {
        case 'key' : self.ID = d.v; console.log(self.ID);break;
        default : console.error('route not recognized');break;
      } 
  }
  function make (mod) {
    if (process.browser&&mod.html){
      var m = require(mod.id.toUpperCase())
      _[mod.id] = new m(mod.html)
    }
  }
  function conn (conns) {
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

  function unmake (mod) {
    if (process.browser) mod.destroy()
  }

  // utility env stream
  this._read = function (size) {} // !?!
  this.end = function () {}
  this.write  = function (chunk) { // get map stream
    var d = JSON.parse(chunk.toString())
  }
}

inherits(Bricoleur, stream.Stream)
module.exports = Bricoleur
