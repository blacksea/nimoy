var telepath = require('tele')
, stream = require('stream')
, async = require ('async')
, hash = require('hashish')

module.exports = function (usr) { // BRICOLEUR
  var self = this
  , map = null
  , _ = {} // module scope
  _.bus = self // fix this hack!
  telepath(this)

  // detect if running in node or browser
  if (global.process && global.process.title === 'node') self.scope = 'server'
  if (!global.process) self.scope = 'client'
  if (usr) self.usr = usr
    
  this.recv = function (buffer) {
    var data = JSON.parse(buffer.toString())

    if (data.meta === 'module_map') { // add map 
      map = data
      self.map = data
      self.build()
    } else if (!data.client_id) { // pass through to out
      if (self.client_id) data.id = self.client_id
      self.send(data)
    } else if (data.id) {
      console.log('send to '+id)
    }
  }

  this.build = function () { // loadModule with mods from map array
    if (!map) throw new Error('no map')
    async.forEach(map[self.scope], lookupModule, connModules)

    function lookupModule (mod, cb) {
      var modules = usr.modules[self.scope]
      for (var i=0;i<modules.length;i++) {
        if (modules[i]===mod.id) {
          console.log('loading mod '+mod.id)
          self.loadModule(mod)
          break
        } 
      }
      cb()
    }

    function connModules () {
      if (usr.conns) {
        console.log('modules loaded :: connecting modules...')
        async.eachSeries(usr.conns[self.scope], self.connModule, function () {
          console.log('connected modules for : '+usr.host)
        })
      }
      if (!usr.conns) console.log('no conns for : '+usr.host)
    }
  }

  this.connModule = function (conn, cb) { // ['modA>modB','modB>modC'] make module connections
    var modA = null
    , modB = null

    for (key in conn) { // could be clearer
      modA = _[conn[key].split('>')[0]] 
      modB = _[conn[key].split('>')[1]] 
      console.log('connecting ' + conn[key])
      
      if (!modA.out || !modB.in) throw new Error(modA+','+modB+' :no .out or .in connections')
      if (modA.out && modB.in) modA.out.pipe(modB.in)
      cb()
    }
  }

  this.disconnModule = function (disconn) {
  }

  this.loadModule = function (mod) { // load module!
    if (self.scope==='server') _[mod.id.toUpperCase()] = require(mod.filePath)
    if (self.scope==='client') {
      _[mod.id.toUpperCase()] = require(mod.id)
    }

    _[mod.id] = new _[mod.id.toUpperCase()]()
    if (mod.html) _[mod.id].render(mod.html)
  }

  this.unloadModule = function (mod) {
  }

  // ------------------------------------------------------------
  this.addConnection = function (key) { // user socket connection
    self[key] = {}
    var s = self[key]
    s.id = key

    // add write stream
    s.in = new stream.Writable()
    s.in._write = function (chunk, encoding, cb) {
      self.recv(chunk) // add id to obj -- for filtering
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
