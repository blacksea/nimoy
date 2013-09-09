var stream = require('stream')

module.exports = Bricoleur

function Bricoleur (opts) { 
  if (!opts) opts = {}

  var self = this

  // MODULE SCOPE
  var _ = {}
  _.brico = new stream.Stream
  _.brico.readable = true
  _.brico.writable = true

  // UTILITIES
  function handleMapData (mod) {
    if (!self.moduleMap) self.moduleMap = []
    self.moduleMap.push(mod)
  }

  // HANDLE SOCKET CONNECTIONS
  this.addSocket = function (id) {
    self[id] = new stream.Stream
    self[id].writable = true
    self[id].readable = true
    self[id].pipe(_.brico).pipe(self[id])
    self[id].end = function () {
      console.log(id+' closed')
    }
  }

  // META STREAM INTERFACE
  this.metaStream = new stream.Stream
  this.metaStream.type = null
  this.metaStream.writable = true
  this.metaStream.readable = true
  this.metaStream.write = function (chunk) {
    var data = JSON.parse(chunk)
    if (data.process) {
      self.metaStream.type = 'moduleData'
      handleMapData(data) // map data
    }
  }

  // API / COMMANDS
  var api = {
    make: function (mod) {
      var libName = mod.id.toUpperCase()
      var lib = require(libName)
      _[mod.id] = new lib() 
      if (process.browser && mod.html) _[mod.id].render(html)
    },
    unmake: function (mod) {
      _[mod.id].destroy()
    },
    conn: function (conss) { // fix ugliness
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
  this.cmd = function (params) {
    var cmd = params[0]
    if (!api[cmd]) console.error('command '+cmd+' unknown')
    if (api[cmd]) api[cmd](params.slice(1))
  }
}
