var through = require('through')
var asyncMap = require('slide').asyncMap
var uglifyJS = require('uglify-js')
var stylus = require('stylus') 
var inherits = require('inherits')
var fs = require('fs')

var browserify = require('browserify')

module.exports = Compiler

function Compiler (opts) { 
  var L = opts.path_wilds[opts.path_wilds.length-1]
  if (L !== '/') opts.path_wilds += '/'

  var self = this
  var b = browserify()
  var wilds = opts.path_wilds
  var css = ''

  fs.readFile(opts.path_styl, function (e, buf) {
    if (e) console.error(e)
    if (!e) css += buf.toString()
  })

  b.add(opts.path_env)

  // TRANSFORM STREAM
  function handleModule (chunk) {
    var s = this
    var mod = JSON.parse(chunk.toString())
    b.require(wilds+mod.id+'.js',{expose:mod.id.toUpperCase()}) // kind of hacky :(
    if (!mod.deps) s.queue(JSON.stringify(mod)) // doesn't make sense...but for consistency...
    if (mod.deps) {
      function handleDep (file, next) {
        var dep = ''
        var ext = file.split('.')[1]
        fs.readFile(wilds+file, function (e,buf) {
          if (e) console.error(e)
          dep = buf.toString()
          if (ext==='styl') css += dep
          if (ext==='html') mod[ext] = dep
          next()
        })
      }
      asyncMap(mod.deps, handleDep, function () {
        s.queue(JSON.stringify(mod))
      }) 
    }
  }
  function compile () {
    self.s.emit('end')
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
    stylus.render(css, {filename:opts.path_css}, function (e, compiledCSS) {
      if (e) console.error(e)
      fs.writeFile(opts.path_css, compiledCSS, function (e) {
        if (e) cosole.error(e)
        console.log('wrote '+opts.path_css)
      })
    })
  }
  this.s = through(handleModule, compile,{autoDestroy:false})
}
