// BRICO
var level = require('level')
var db = level('./data') // username?

// this should only run server side
function mapWilds (wilds, fin) {
  var fs = require('fs')
  var asyncMap = require('slide').asyncMap
  var MAP = {}

  function readPkg (modDir, next) {
    var pkg = JSON.parse(fs.readFileSync(wilds+modDir+'/package.json'))
    if (pkg.brico) { 
      MAP[pkg.name] = pkg 
      next() 
    } else next()
  }

  fs.readdir(wilds, function moduleList  (e, modules) {
    if (!e) asyncMap(modules, readPkg, fin)
  })
}

module.exports = function bricoleur (opts) {
  var self = this

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

  this.disConn = function (mods, cb) { // disconnect modules
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
