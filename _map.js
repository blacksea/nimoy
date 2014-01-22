// MAP
// looks for package.json with nimoy property

var fs = require('fs')
var asyncMap = require('slide').asyncMap

module.exports = function Map (dir, cb) {
  if (dir[dir.length-1] !=='/') dir += '/'
  var MAP = {}
  function readPkg (modDir, next) {
    console.log(modDir)
    var jsn = fs.readFileSync(dir+modDir+'/package.json').toString()
    if (jsn) {
      var pkg = JSON.parse(jsn)
      if (pkg.nimoy) { 
        MAP[pkg.name] = pkg 
        next() 
      } else next()
    } else next()
  }
  fs.readdir(dir, function moduleList (e, modules) {
    if (e) console.error(e)
    if (!e) {
      asyncMap(modules, readPkg, function end () {
        cb(MAP)
      })
    }
  })
}
