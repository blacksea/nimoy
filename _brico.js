// BRICO

var env = process.title // node or browser
var through = require('through')

module.exports = function bricoleur (db, ready) {
  var self = this

  var dbs = db.liveStream() 
  dbs.on('data', function (d) {
    console.log(d)
  })

  ready()

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
  // map / survey / library -- transforms?
  // search
  // put / rm
  // conn / disconn
  // env / status
  // events
  // object/transport/stream protocol
}
