var stream = require('stream')
, eventEmitter = require('events').EventEmitter
, inherits = require('inherits')

function Bricoleur (opts) { // provide a scope option to set server/browser
  if (!(this instanceof Bricoleur)) return new Bricoleur(opts)
  stream.Stream.call(this)
  if (!opts) opts = {}
  this.readable = true
  this.writable = true

  // CONSTANTS
  var SELF = this
  , MAP = null
  , BROWSER = false
  , _ = {} // module scope

  if (process.browser) BROWSER = true

  this.compile = function compileClient (next) {
  }

  this.write  = function (chunk,enc,next) {
    console.log(chunk.toString())
  }

  this._read = function (size) {} // !?!

  this.end = function () {
  }

  this.addConnection = function (key) { // user socket connection
    self[key] = {}
    var s = self[key]
    s.id = key
    self.conns.push(key)

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
  } 
}

inherits(Bricoleur, stream.Stream)
module.exports = Bricoleur
