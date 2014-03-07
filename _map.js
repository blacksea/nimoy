// MAP 

var fs = require('fs')
var asyncMap = require('slide').asyncMap
var through = require('through')
var browserify = require('browserify')
var uglify = require('uglify-js')

module.exports = function Map (opts) {

  // add an option to watch dir and recompile

  var s = through(function write (d) {
    this.queue(d)
  }, function end () {
    this.emit('end')
  })

  var MAP = {
    browser: {},
    node: {}
  }

  var dir = opts.wilds
  var b = browserify(opts.browserify)

  if (dir.slice(-1) !== '/') dir += '/'

  fs.readdir(dir, function moduleList (e, modules) {
    if (e) console.error(e)
    if (!e) asyncMap(modules, readPkg, function () {

      s.write(JSON.stringify(MAP))
      
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
        s.end()
      } else s.end()
    })
    b.on('error', console.error)
  }

  return s
}
