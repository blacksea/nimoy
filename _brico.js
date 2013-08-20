var stream = require('stream')
, inherits = require('inherits')

function Bricoleur (opts) { // provide a scope option to set server/browser
  if (!(this instanceof Bricoleur)) return new Bricoleur(opts)
  stream.Stream.call(this)
  if (!opts) opts = {}
  this.readable = true
  this.writable = true
  this._buffer = []

  // use a custom event for updating environment
  // hook env data into local storage for cache or db for saving

  // CONSTANTS
  var self = this
  , MAP = null
  , _ = {} // module scope

  this.write  = function (chunk, enc, next) {
    console.log(chunk.toString())
  }

  this._read = function (size) {} // !?!

  this.end = function () {}

  this.make = function (mod) {
    if (process.browser&&mod.html){
      var m = require(mod.id.toUpperCase())
      var modo = new m(mod.html)
      console.log(modo)
      _[mod.id] = modo
    }
  }

  this.unmake = function (mod) {
    if (process.browser) mod.destroy()
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

  this.addConnection = function (key) { // user socket connection
    self[key] = {}
    var s = self[key]
    s.id = key
    self.conns.push(key)

    // add write stream
    s.in = new stream.Writable()
    s.in._write = function (chunk, encoding, cb) {
      self.recv(chunk)  
      cb()
    }
    // add read stream
    s.out = new stream()
    s.out.readable = true
    s.send = function (data) {
      s.out.emit('data',JSON.stringify(data))
    }
  }

  this.removeConnection = function (key) {
    self[key].out.emit('close')
    delete self[key]
  } 
}

inherits(Bricoleur, stream.Stream)
module.exports = Bricoleur
