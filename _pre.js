var browserify = require('browserify')
, uglifyJS = require('uglify-js')
, stylus = require('stylus')
, telepath = require('tele')
, fs = require('fs')

// PRECOMPILER
module.exports = function (opts) { 
  telepath(this)

  if (!opts) opts = {compress:false}

  var self = this
  , destJS = './_wilds/_bundle.js'
  , srcJS = ['./__clnt.js']
  , MAP = []
  , CSS = ''
  , srcCSS = './_wilds/_default.styl'
  , destCSS = './_wilds/_styles.css'

  this.recv = function (moduleData) {
    var mod = JSON.parse(moduleData.toString())
    if (typeof mod === 'object' && !mod.event) {
      console.dir(mod)
      for (var i=0;i<mod.scope.length;i++) {
        if (mod.scope[i]==='client') srcJS.push(mod.filePath) // add to browserify
        if (mod.styl) CSS += mod.styl
      }
      MAP.push(mod)
    }
    else if (mod.event === 'done') compile()
  }

  function compile () {
    browserify(srcJS).bundle({}, function (err, bundle) {
      if (opts.compress === true) {
        var bundleMin = uglifyJS.minify(bundle,{fromString: true})
        bundle = bundleMin.code
      } 
      fs.writeFile(destJS, bundle, function (err) {
         if (err) throw err
      })
    })

    fs.readFile(srcCSS, function (err, buffer) {
      var styles = buffer.toString()
      styles += CSS
      stylus.render(styles, {filename:destCSS}, function (err, css) {
        if (err) throw err
        fs.writeFile(destCSS, css, function (err) {
          if (err) throw err
          // cb();
        })
      })
    })
  }
}
