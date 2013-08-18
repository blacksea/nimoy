var asyncMap = require ('slide').asyncMap
, stream = require('stream')
, hash = require('hashish')
, util = require('util')

util.inherits(Bricoleur, stream.Duplex)

module.exports = Bricoleur

function Bricoleur (opts) { // provide a scope option to set server/browser
  if (!(this instanceof Bricoleur)) return new Bricoleur(opts)
  if (!opts) opts = {}
  stream.Duplex.call(this,opts)

  // CONSTANTS
  var SELF = this
  , MAP = null
  , _ = {} // module scope

  // browser scope needs to handle html templates

  this.compile = function compileClient (next) {
    
  }

  this._write  = function (chunk,enc,next) {
    // console.log(chunk.toString())
    next()
  }

  this.on('pop', function () {
    console.log('gumshoe')
  })

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
  } 
}
