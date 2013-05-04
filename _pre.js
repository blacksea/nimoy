var browserify = require('browserify')
, uglifyJS = require('uglify-js')
, stylus = require('stylus')
, telepath = require('tele')
, fs = require('fs')

module.exports = function (opts) { // PRECOMPILER
  telepath(this)

  if (!opts) opts = {compress:false}
  if (!opts.compress) opts.compress = false

  var self = this
  , destCSS = './_wilds/_styles.css'
  , destJS = './_wilds/_bundle.js'
  , CSS = ''

  var map = {
    meta: 'module_map',
    client: [],
    server: []
  }

  this.recv = function (moduleData) {
    var mod = JSON.parse(moduleData.toString())
    if (typeof mod === 'object' && !mod.event) {
      for (var i=0;i<mod.scope.length;i++) {
        var scope = mod.scope[i]
        if (scope==='client') opts.js.push(mod.filePath) // add to browserify
        if (mod.styl) CSS += mod.styl
        map[scope].push(mod)
      }
    }
  }
    
  self.in.on('finish', function () {
    compile()
    self.send(map)
  })

  function compile () {
    browserify(opts.js).bundle({}, function (err, bundle) {
      if (err) throw err
      if (opts.compress === true) {
        var bundleMin = uglifyJS.minify(bundle,{fromString: true})
        bundle = bundleMin.code
      }
      fs.writeFile(destJS, bundle, function (err) {
        if (err) throw err
        console.log('fin')
        self.out.emit('end') 
      })
    })

    fs.readFile(opts.css, function (err, buffer) {
      if (err) throw err
      var styles = buffer.toString()
      styles += CSS
      stylus.render(styles, {filename:destCSS}, function (err, css) {
        if (err) throw err
        fs.writeFile(destCSS, css, function (err) {
          if (err) throw err
          console.log('css compiled')
          // cb();
        })
      })
    })
  }
}
