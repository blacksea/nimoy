var stream = require('stream').Stream

module.exports = Bricoleur

function Bricoleur (opts) { 
  if (!opts) opts = {}

  var self = this

  // MODULE SCOPE
  var _ = {}
  _.brico = new Stream
  _.brico.readable = true
  _.brico.writable = true

  this.addSocket = function (id) {
    self[id] = new Stream
    self[id].writable = true
    self[id].readable = true
    self[id].pipe(_.brico).pipe(self[id])
  }

  function make (mod) {
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
