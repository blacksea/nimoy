var through = require('through')
var asyncMap = require('slide').asyncMap
var uglifyJS = require('uglify-js')
var stylus = require('stylus') 
var fs = require('fs')

var browserify = require('browserify')

module.exports = Compiler

function Compiler (opts) { 
  if (opts.path_wilds[opts.path_wilds.length-1] !== '/') opts.path_wilds += '/'
  var Self = this
  var Wilds = opts.path_wilds
  var WildsProcessed = false
  var CSS = ''

  var b = browserify()
  b.add(opts.path_env)

  fs.readFile(opts.path_styl, function (e, buf) {
    if (e) console.error(e)
    if (!e) CSS += buf.toString()
  })

  this.s = through(HandleModule, Compile, {autoDestroy:false})

  function HandleModule (chunk) {
    var s = this
    var mod = JSON.parse(chunk.toString())
    
    // if module is updated make it fresh!
    if (WildsProcessed === true) mod.fresh = true 

    // kind of hacky :(
    b.require(Wilds+mod.id+'.js',{expose:mod.id.toUpperCase()}) 

    // doesn't make sense...but for consistency...
    if (!mod.deps) s.queue(JSON.stringify(mod)) 

    function handleDep (file, next) {
      var dep = ''
      var ext = file.split('.')[1]
      fs.readFile(Wilds+file, function (e,buf) {
        if (e) console.error(e)
        dep = buf.toString()
        if (ext==='styl') CSS += dep
        if (ext==='html') mod[ext] = dep
        next()
      })
    }

    if (mod.deps) asyncMap(mod.deps, handleDep, function () {
      s.queue(JSON.stringify(mod))
    })
  }

  function Compile () {
    WildsProcessed = true
    Self.s.emit('data', JSON.stringify({stat:'mapReady'}))

    var bundleFile = fs.createWriteStream(opts.path_bundle)
    b.bundle().pipe(bundleFile)

    bundleFile.on('close', function () {
      console.log('wrote '+opts.path_bundle)
      if (opts.compress === true) {
        var min = uglifyJS.minify(opts.path_bundle) 
        fs.writeFile(opts.path_bundle, min.code, function (e) {
          if (!e) console.log('wrote minified _bundle.js')
        })
      }
    })
    bundleFile.on('error', function (e) {
      console.error(e)
    })

    stylus.render(CSS, {filename:opts.path_css}, function (e, compiledCSS) {
      if (e) console.error(e)
      fs.writeFile(opts.path_css, compiledCSS, function (e) {
        if (e) cosole.error(e)
        console.log('wrote '+opts.path_css)
      })
    })
  }
}
