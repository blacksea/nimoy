// BRICO

var through = require('through')

module.exports = Bricoleur

function Bricoleur (opts) { 
  if (!opts) opts = {}
  var self = this
  
  this.addSocket = function (id, socketAdded) { // direct communication layer
    var comfilter = through(function write (chunk) {
      if (typeof chunk === 'string') {
        var d = JSON.parse(chunk)
        if (d.api) self.api.write(d.api)
        if (!d.api) (chunk)
      }
    }, function end () {
      this.emit('end')
    }, 
      {autoDestroy:false}
    ) 

    self[id] = through(SocWrite, SocEnd, {autoDestroy:false})
    self[id].key = id
    socketAdded()
  }

  this.removeSocket = function (id) {
    self[id].destroy()
    delete self[id]
  }

  function SocWrite (chunk) {
    var d = JSON.parse(chunk)
    this.queue(chunk)
  }

  function SocEnd () {
    var k = this.key
    this.emit('end')
    console.log('closed socket: '+k)
  }

  // coreblock of somekind to multiplex stream connections....
  // API : gets called through env
  
  this.api = through(APIwrite, APIend, {autoDestroy:false})

  function APIwrite (chunk) {
    if (!(chunk instanceof Array)) console.error('please call API with array')
    if (chunk instanceof Array) {
      var cmd = chunk[0]
      var params = chunk[1]
      if (!API[cmd]) console.error(cmd+' is not an API command')
      if (API[cmd]) API[cmd](params)
    }
  }

  function APIend () {}

  var API = {
    test: function (msg) {
      console.log(msg)
      if (process.browser) window.document.title = msg
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
}
