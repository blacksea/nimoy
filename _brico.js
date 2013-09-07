var stream = require('stream')

module.exports = Bricoleur

function Bricoleur (opts) { 
  if (!opts) opts = {}

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

  this.socSend = function (d) {// out to brico
    if (!d.k) console.error('no client id')
    if (d.k) self[d.k].emit('data', JSON.stringify(d))
  }
  this.socRecv = function (d) {// in from brico
    if (d.k) console.log(d) // handle input from console
    if (d.r&&d.v) handleRoute(d)
    if (d.id&&d.process) make(d)
  }
  this.socRm = function (key) {
    self[key].emit('close')
    delete self[key]
  } 
  
  function handleRoute (d) { // direct function call map
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
}
