// BRICO

var env = process.title // node or browser
var through = require('through')
var livefeed = require('level-livefeed')



module.exports = function bricoleur (db) {
  var self = this

  if (env === 'node') var map = require('./_map')(opts.dir)

  this.find = function (string, cb) { // search map for module

  }
  this.put = function (mod, cb) { // put module
    // put 'module' opt=string opt=string

  }
  this.rm = function (mod, cb) { // rm module
    // rm module

  }
  this.conn = function (mods, cb) { // connect modules
    // conn module module module

  }
  this.disconn = function (mods, cb) { // disconnect modules
    // disconn module /single /chain

  }
  this.status = function (cb) {
    // view env & conns
    
  }

  var level = livefeed(db)

  level.on('data', function (d) {
    console.log(d)
  })
  // map / survey / library -- transforms?
  // search
  // put / rm
  // conn / disconn
  // env / status
  // events
  // object/transport/stream protocol
}
