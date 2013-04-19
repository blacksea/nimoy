var browserify = require('browserify'),
uglifyJS = require('uglify-js'),
stylus = require('stylus'),
telepath = require('tele'),
fs = require('fs')

// PRECOMPILER
module.exports = function (opts) { // stream output to rtr???
  telepath(this)
  
  var self = this,
  destJS = './_wilds/_bundle.js',
  srcJS = ['./__clnt.js'],
  MAP = [],
  CSS = '',
  srcCSS = './_wilds/_default.styl',
  destCSS = './_wilds/_styles.css'

  this.recv = function (moduleData) {
    var mod = JSON.parse(moduleData.toString())
    
    if (typeof mod === 'object') {
      for (var i=0;i<mod.scope.length;i++) {
        if (mod.scope[i]==='client') srcJS.push(mod.filePath) // add to browserify
        if (mod.styl) CSS += mod.styl
      }
      MAP.push(mod)
    }
    else if (mod === 'done') compile()
  }

  function compile () {
    browserify(JS).bundle({}, makeJS)
    if (opts.compress === true) {
      var bundleMin = uglifyJS.minify(JS,{fromString: true})
      bundle = bundleMin.code
    }
    fs.writeFile(opts.destJS, JS, function (err) {
      if (err) throw err
    })
    fs.readFile(srcCSS, function (err, buffer) {
      var styles = buffer.toString()
      styles += CSS
      stylus.render(styles, {filename:destCSS}, function (err, css) {
        if (err) throw err
        fs.writeFile(destCSS, css, function (err) {
          if (err) throw err
          cb();
        })
      })
    })
  }
}
