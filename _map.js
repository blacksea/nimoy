// MAP : looks for package.json with nimoy property

var fs = require('fs')
var asyncMap = require('slide').asyncMap
var browserify = require('browserify')

module.exports = function Map (opts, cb) {
  var MAP = {}
  var dir = opts.wilds

  if (dir[dir.length-1] !=='/') dir += '/'
  fs.readdir(dir, function moduleList (e, modules) {
    if (e) console.error(e)
    if (!e) {
      asyncMap(modules, readPkg, function end () {
        cb(MAP)
        bundleMap()
      })
    }
  })

  function bundleMap () {
    var b = browserify('./_client.js')
    var bundle = fs.createWriteStream(opts.bundle)
    var s = b.bundle()
    s.pipe(bundle)
    s.on('end', function wroteBundle () {
      // check bundle file size
      console.log('wrote '+opts.bundle)
    })
  }

  function readPkg (modDir, next) {
    var jsn = fs.readFileSync(dir+modDir+'/package.json').toString()
    if (jsn !== 'undefined' && jsn !== '' && jsn[0] === '{') { // do better json validation
      var pkg = JSON.parse(jsn)
      if (pkg.nimoy) { 
        if (pkg.nimoy.process === 'browser') b.require(dir+pkg.name, {expose:pkg.name})
        MAP[pkg.name] = pkg 
        next() 
      } else next()
    } else next()
  }
}
