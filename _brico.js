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

  // _.com = new Duplex // module layer
  
  this.socAdd = function (key, cb) { // user socket connection
    self[key] = new stream.Stream
    self[key].writable = true
    self[key].readable = true
    self[key].write = function (chunk) {
      console.log(chunk)
    }
    self[key]._read = function (size) {}
    self[key].on('error', function (e) {
      console.error(e)
    })
    self[key].end = function () {
      console.log('closed')
    }
    //self[key].pipe(_.com).pipe(self[key]) // patch into module scope
    cb()
  }
  this.socSend = function (d) {
    if (!d.k) console.error('no client id')
    if (d.k) self[d.k].emit('data', JSON.stringify(d))
  }
  this.socRecv = function (d) {
    if (d.r&&d.v) handleRoute(d)
  }
  this.socRm = function (key) {
    self[key].emit('close')
    delete self[key]
  } 
  
  function handleRoute (d) {

    switch (d.r) {
      case 'key' : self.ID = d.v; console.log(self.ID); break;
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
