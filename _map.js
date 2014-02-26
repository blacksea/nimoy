// MAP 

var fs = require('fs')
var asyncMap = require('slide').asyncMap
var browserify = require('browserify')
var uglify = require('uglify-js')
var through = require('through')

module.exports = function Map (opts) {
  var MAP = {
    browser: {},
    node: {}
  }

  var dir = opts.wilds
  var b = browserify('./_client.js')

  if (dir[dir.length-1] !=='/') dir += '/'
  fs.readdir(dir, function moduleList (e, modules) {
    if (e) console.error(e)
    if (!e) asyncMap(modules, readPkg, function () {

      s.write({key:'^:', value:MAP, valueEncoding:'json'})
      
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
    b.on('error', function (e) {
      console.error(e)
    })
  }

  var s = through(function write (chunk) {
    this.emit('data', chunk)
  }, function end () {
    this.emit('end')
  })

  return s
}
