var fs = require('fs')
var asyncMaps = require('slide').asyncMap
var browserify = require('browserify')

function mapWilds (wilds, fin) { // create a map and store in database : also set a bundle for browserify/watchify
  var MAP = {}
  var fs = require('fs')
  var asyncMap = require('slide').asyncMap
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
