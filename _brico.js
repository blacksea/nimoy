var telepath = require('tele')
, stream = require('stream')
, async = require ('async')

module.exports = function (usr) { // BRICOLEUR
  var self = this
  , map = null
  , _ = {} // module scope
  telepath(this)

  // detect if running in node or browser
  if (global.process && global.process.title === 'node') self.scope = 'server'
  if (!global.process) self.scope = 'client'

  if (usr) self.usr = usr
    
  this.recv = function (buffer) {
    var data = JSON.parse(buffer.toString())

    if (data.meta === 'module_map') { // add map 
      map = data[self.scope]
      self.build()
    }
  }

  this.build = function () { // load modules
    if (!map) throw new Error('no map')

    async.forEach(map, match, function () {
      console.log(usr.host+' modules loaded')
    })

    function match (mod, cb) {
      var modules = self.usr.modules
      for (var i=0;i<modules.length;i++) {
        if (modules[i]===mod.id) {
          self.loadModule(mod)
          cb()
          break
        } else cb()
      }
    }
  }

  this.connModule = function (connect) { // ['modA>modB','modB>modC']

  }

  this.disconnModule = function (disconnect) {

  }

  this.loadModule = function (mod) { // load module!
    _[mod.id.toUpperCase()] = require(mod.filePath)
    _[mod.id] = new _[mod.id.toUpperCase()]()
    if (mod.html) _[mod.id].template = mod.html
  }

  this.unloadModule = function (mod) {

  }

  // ----------------------------------------------------
  this.addConnection = function (key) {
    self[key] = {}
    var s = self[key]

    // add write stream
    s.in = new stream.Writable()
    s.in._write = function (chunk, encoding, cb) {
      self.recv(chunk)
      cb()
    }

    // add read stream
    s.out = new stream()
    s.out.readable = true
    s.send = function (data) {
      s.out.emit('data',JSON.stringify(data))
    }
  }

  this.removeConnection = function (key) {
    self[key].out.emit('close')
    delete self[key]
  }// ---------------------------------------------------
}
