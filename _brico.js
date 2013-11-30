// BRICO
var through = require('through')

var fern = require('fern')

module.exports = Bricoleur

function Bricoleur (opts) { 
  if (!opts) opts = {}
  var self = this
  
  this.handleSoc = function (id, socketAdded) {
    self[id] = through(SocWrite, SocEnd, {autoDestroy:false})
    self[id].key = id

    self[id].pipe(self.api).pipe(through(function write (chunk) {
      console.log(chunk)
    }, function () {
      this.emit('end')
    }))
    socketAdded()
  }

  function SocWrite (chunk) {
    this.queue(chunk)
  }

  function SocEnd () {
    var k = this.key
    this.emit('end')
  }

  var API = {
    test: function (msg,cb) {
      console.log(msg)
      if (process.browser) window.document.title = msg
      cb(msg)
    },
    loadEnv: function (user,cb) {
    },
    map: function (map, cb) {
      MAP = map
      cb('loaded map')
    },
    make: function (mod,cb) {
      var libName = mod.id.toUpperCase()
      var lib = require(libName)
      _[mod.id] = new lib() 
      if (process.browser && mod.html) _[mod.id].render(html)
    },
    unmake: function (mod,cb) {
      _[mod.id].destroy()
    },
    conn: function (conss,cb) {      
      conns.forEach(function handleConnection (conn) {
        if (conn.match(/\+/) !== null) { var modA = conn.split('+')[0] , modB = conn.split('+')[1]
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
  this.api = new fern({key:'api',tree:API})
}
