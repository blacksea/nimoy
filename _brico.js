var stream = require('stream')

module.exports = Bricoleur

function Bricoleur (opts) { // BRICOLEUR
  if (!opts) opts = {}
  this.readable = true
  this.writable = true
  this._buffer = []

  var self = this
  , MAP = null
  , ENV = {}
  , _ = {} // module scope

  _.brico = new stream.Stream
  _.brico.readable = true
  _.brico.writable = true
  _.brico._read = function (size) {}
  _.brico.write = function (chunk) {
    var d = JSON.parse(chunk)
    d.k = self.key
    self.socSend(d)
  }

  this.socAdd = function (key, cb) { // user socket connection
    self.key = key
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
    if (d.k) console.log(d)
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
    console.log(mod)
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
        console.log(_[modB])
      }
      if (conn.match(/\-/) !== null) {
        var modA = conn.split('-')[0]
        , modB = conn.split('-')[1]
        modA.unpipe(modB)
      }
    })
  }
}

