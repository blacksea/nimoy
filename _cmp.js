var Writable = require('stream').Writable
, browserify = require('browserify')
, uglifyJS = require('uglify-js')
, stylus = require('stylus') 
, util = require('util')

util.inherits(Compiler, Writable)

module.exports = Compiler
// compiler prepares files for client

function Compiler (opts) {
  if (!(this instanceof Compiler)) return new Compiler(opts)
  Writable.call(this)

  var self = this

  this._write = function (chunk, enc, next) {
    var mod = JSON.parse(chunk.toString())
    handleModule(mod)
    next()
  }

  function handleModule (mod) {
    console.log(mod)
  }
}
