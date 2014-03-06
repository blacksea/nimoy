// MAP 

var fs = require('fs')
var asyncMap = require('slide').asyncMap
var Emitter = require('events').EventEmitter
var browserify = require('browserify')
var uglify = require('uglify-js')

module.exports = function Map (opts) {

  // add an option to watch dir and recompile

  var emitter = new Emitter

  var MAP = {
    browser: {},
    node: {}
  }

  var dir = opts.wilds
  var b = browserify(opts.browserify)

  if (dir[dir.length-1] !=='/') dir += '/'
  fs.readdir(dir, function moduleList (e, modules) {
    if (e) console.error(e)
    if (!e) asyncMap(modules, readPkg, function () {

      emitter.emit('mapped', '^', JSON.stringify(MAP))
      
      bundleJS()
    })
  })

  function readPkg (modDir, next) {
    var jsn = fs.readFileSync(dir+modDir+'/package.json').toString()
    if (jsn !== 'undefined' && jsn !== '' && jsn[0] === '{') { // do better json validation
      var pkg = JSON.parse(jsn)
      if (pkg.nimoy) { 
        if (pkg.nimoy.process === 'browser') b.require(dir+pkg.name, {expose:pkg.name})

        MAP[pkg.nimoy.process][pkg.name] = pkg

        next() 
      } else next()
    } else next()
  }

  function bundleJS () {
    var bundle = fs.createWriteStream(opts.bundle)
    b.bundle().pipe(bundle)
    bundle.on('finish', function () {
      if (opts.min === true ) {
        var min = uglify.minify(opts.bundle)
        fs.writeFileSync(opts.bundle, min.code)
        emitter.emit('bundled')
      } else emitter.emit('end')
    })
    b.on('error', console.error)
  }

  return emitter
}
