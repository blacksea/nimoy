// BRICO
var through = require('through')
var level = require('level')

module.exports = Bricoleur

function Bricoleur (opts) { 
  if (!opts) opts = {}

  var self = this

  // adhoc system for module connections 
  // just connect directly to a module
  // really fast connections -- streams -- object -- trees
  // HANDLE SOCKET CONNECTIONS  to >---> from browser to map
  
  this.addSocket = function (id) { 
    self[id] = through(function write (chunk) {
      this.queue(chunk)
    }, function end () {
      this.emit('end')
    }, {autoDestroy:false})
  }

  this.metaStream = through(MetaWrite, MetaEnd, {autoDestroy:false})
  
  function MetaWrite (chunk) {
    var data = JSON.parse(chunk)
    if (data.process) handleMapData(data) // map data
    if (data.host) {
      console.log(data)
      if (process.browser) window.document.title = data.host
    }
    if (data.fresh && data.fresh === true) console.log(JSON.parse(chunk)) 
  }
  function MetaEnd () {}

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
