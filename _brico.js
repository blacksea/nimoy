// BRICO
var through = require('through')
var fern = require('fern')

module.exports = Bricoleur

function Bricoleur (opts) { 
  if (!opts) opts = {}
  var self = this
  
  this.addSocket = function (id, socketAdded) { // direct communication layer
    self[id] = through(SocWrite, SocEnd, {autoDestroy:false})
    self[id].key = id
    self[id].pipe(self.api).pipe(through(function write (chunk) {
      console.log(chunk)
    }, function () {
      this.emit('end')
    }))

    socketAdded()
  }

  this.removeSocket = function (id) {
    self[id].destroy()
    delete self[id]
  }

  function SocWrite (chunk) {
    // route to function ?!?
    console.log(chunk)
    this.queue(chunk)
  }

  function SocEnd () {
    var k = this.key
    this.emit('end')
    console.log('closed socket: '+k)
  }

  var API = {
    test: function (msg,cb) {
      console.log(msg)
      if (process.browser) window.document.title = msg
      cb(msg)
    },
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
  this.api = new fern({key:'api',tree:API})
}
