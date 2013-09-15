// BRICO

var through = require('through')

module.exports = Bricoleur

function Bricoleur (opts) { 
  if (!opts) opts = {}
  var self = this
  
  // GRAFT ON SOCKET
  this.addSocket = function (id) { 
    self[id] = through(function write (chunk) {
      this.queue(chunk)
    }, function end () {
      this.emit('end')
    }, {autoDestroy:false})
  }

  // API
  
  this.api = through(APIwrite, APIend, {autoDestroy:false})

  function APIwrite (chunk) {
    var cmd = chunk[0]
    var params = chunk[1]

    API[cmd](params)
  }

  function APIend () {}

  var API = {
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
}
