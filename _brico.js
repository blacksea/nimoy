var stream = require('stream')
var through = require('through')

module.exports = Bricoleur

function Bricoleur (opts) { 
  if (!opts) opts = {}

  var self = this

  // UTILITIES
  function handleMapData (mod) {
    if (!self.moduleMap) self.moduleMap = []
    self.moduleMap.push(mod)
  }

  // system for module connections / routing / just connect directly to a module

  // HANDLE SOCKET CONNECTIONS
  this.addSocket = function (id) { // send modulemap! & user environment data
    self[id] = through(function write (chunk) {
      this.queue(chunk)
    }, function end () {
      console.log(id+' closed')
      this.emit('end')
    }, {autoDestroy:false})
  }

  // META STREAM INTERFACE
  this.metaStream = through(metaWrite,metaEnd,{autoDestroy:false})
  function metaWrite (chunk) {
    var data = JSON.parse(chunk)
    if (data.process) handleMapData(data) // map data
    if (data.fresh && data.fresh === true) console.log(JSON.parse(chunk)) // update map when module changes
    if (data.host) console.log(data)
  }
  function metaEnd () {
    console.log('map ready')
  }

  // API / COMMANDS
  var api = {
    loadEnv: function (user,cb) {
    },
    make: function (mod,cb) {
      var libName = mod.id.toUpperCase()
      var lib = require(libName)
      _[mod.id] = new lib() 
      if (process.browser && mod.html) _[mod.id].render(html)
      // verify module creation somehow
    },
    unmake: function (mod,cb) {
      _[mod.id].destroy()
    },
    conn: function (conss,cb) { // fix ugliness
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
