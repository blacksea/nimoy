var telepath = require('tele')
, stream = require('stream')

module.exports = function (usr) { // BRICOLEUR
  var self = this
  , map = null
  telepath(this)

  // detect if running in node or browser
  if (global.process && global.process.title==='node') self.scope = 'server'
  if (!global.process) self.scope = 'client'

  if (usr) self.usr = usr
    
  this.recv = function (buffer) {
    var data = JSON.parse(buffer.toString())

    if (data.meta==='module_map') { // add map 
      map = data[self.scope]
      self.build()
    }
  }

  this.build = function () { // load modules
    if (!map) throw new Error('no map')
    for (key in map) {
    }
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
