// MAP 

var fs = require('fs')
var asyncMap = require('slide').asyncMap
var browserify = require('browserify')
var uglify = require('uglify-js')

module.exports = function Map (opts, cb) {
  var MAP = {}
  var dir = opts.wilds
  var b = browserify('./_client.js')

  if (dir[dir.length-1] !=='/') dir += '/'
  fs.readdir(dir, function moduleList (e, modules) {
    if (e) console.error(e)
    if (!e) {
      asyncMap(modules, readPkg, function end () {
        bundleMap()
      })
    }
  })

  function bundleMap () {
    var bundle = fs.createWriteStream(opts.bundle)
    b.bundle().pipe(bundle)
    bundle.on('finish', function () {
      if (opts.min === true ) {
        var min = uglify.minify(opts.bundle)
        fs.writeFileSync(opts.bundle, min.code)
        cb(JSON.stringify(MAP))
      } else cb(JSON.stringify(MAP))
    })
    b.on('error', function (e) {
      console.error(e)
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
