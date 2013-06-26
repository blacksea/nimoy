var telepath = require('tele')
, stream = require('stream')
, asyncMap = require ('slide').asyncMap
, hash = require('hashish')

module.exports = function (usr) { // BRICOLEUR
  var self = this
  , map = null
  , _ = {} // module scope
  _.bus = self // fix this hack!
  telepath(this)

  this.map = {
    server:[],
    client:[]
  }

  // detect if running in node or in browser
  if (global.process) self.scope = 'server' // on sunos global.process.title != node
  if (!global.process) self.scope = 'client'
  if (usr) self.usr = usr
    
  this.recv = function (buffer) { // clean up!
    var data = JSON.parse(buffer.toString())
    console.log(data)

    if (data.event === 'mapping_done') {
      console.log('map complete')
    }
    if (data.event === 'clear') {
      console.log(usr.modules)
    }
    if (data.key === 'module_map') { // handle incoming module data 
      for (var i = 0;i<data.scope.length;i++) {
        self.map[data.scope[i]].push(data)
      }
    } else if (!data.client_id) { // pass through to out
      if (self.client_id) data.id = self.client_id
      self.send(data)
    } else if (data.client_id) {
      self.map[self.scope] = data.map 
      if (data.map) self.build()
    }
  }

  this.build = function () { // loadModule with mods from map array
    console.log(self.map[self.scope])

    asyncMap(self.map[self.scope], lookupModule, connModules)

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
        asyncMap(usr.conns[self.scope], self.connModule, function () {
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
    if (self.scope==='client') _[mod.id.toUpperCase()] = require(mod.id)
    _[mod.id] = new _[mod.id.toUpperCase()]()
    if (mod.html) _[mod.id].render(mod.html)
  }

  this.clear = function (cb) {
    asyncMap(usr.modules[self.scope], unloadModule, cb)
  }

  this.unloadModule = function (mod) {
    if (self.scope === 'client') _[mod].destroy()
    delete _[mod]
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
  } // -----------------------------------------------------------
}
