var stream = require('stream')
, Duplex = require('stream').Duplex
, inherits = require('inherits')

function Bricoleur (opts) { // BRICOLEUR
  stream.Stream.call(this)
  if (!opts) opts = {}
  this.readable = true
  this.writable = true
  this._buffer = []

  var self = this
  , MAP = null
  , ENV = {}
  , _ = {} // module scope

  console.log(process.title)
  
  this.socAdd = function (key, cb) { // user socket connection
    self[key] = new stream.Stream
    self[key].writable = true
    self[key].readable = true
    self[key].write = function (chunk) {
      var d = JSON.parse(chunk)
      self.socRecv(d)
    }
    self[key]._read = function (size) {}
    self[key].on('error', function (e) {
      console.error(e)
    })
    self[key].end = function () {
      console.log('closed')
    }
    cb()
  }
  this.socSend = function (d) {// out to brico
    if (!d.k) console.error('no client id')
    if (d.k) self[d.k].emit('data', JSON.stringify(d))
  }
  this.socRecv = function (d) {// in from brico
    if (d.r&&d.v) handleRoute(d)
    if (d.id&&d.process) make(d)
  }
  this.socRm = function (key) {
    self[key].emit('close')
    delete self[key]
  } 
  
  function handleRoute (d) {
    switch (d.r) {
      case 'key' : self.ID = d.v; console.log(self.ID); break;
      case 'con' : conn(d.v); break;
      default : console.error('route not recognized'); break;
    } 
  }
  function make (mod) {
    if (process.browser&&mod.html) {
      var m = require(mod.id.toUpperCase())
      _[mod.id] = new m(mod.html)
    }
  }
  function unmake (mod) {
    if (process.browser) mod.destroy()
  }
  function conn (conns) {
    conns.forEach(function handleConnection (conn) {
      if (conn.match(/\+/) !== null) {
        var modA = conn.split('+')[0]
        , modB = conn.split('+')[1]
        _[modA].pipe(_[modB])
      }
      if (conn.match(/\-/) !== null) {
        var modA = conn.split('-')[0]
        , modB = conn.split('-')[1]
        modA.unpipe(modB)
      }
    })
  }

  this._read = function (size) {} // !?!
  this.end = function () {}
  this.write  = function (chunk) { // get map stream
    var d = JSON.parse(chunk.toString())
  }
}

inherits(Bricoleur, stream.Stream)
module.exports = Bricoleur
