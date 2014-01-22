var fs = require('fs')
var asyncMaps = require('slide').asyncMap

module.exports = function Map (opts, cb) {
  var MAP = {}
  var asyncMap = require('slide').asyncMap
  function readPkg (modDir, next) {
    var pkg = JSON.parse(fs.readFileSync(wilds+modDir+'/package.json'))
    if (pkg.brico) { 
      MAP[pkg.name] = pkg 
      next() 
    } else next()
  }
  fs.readdir(wilds, function moduleList  (e, modules) {
    if (!e) asyncMap(modules, readPkg, function end () {
      cb(MAP)
    })
  })
}
