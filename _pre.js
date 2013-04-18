var browserify = require('browserify'),
uglifyJS = require('uglify-js'),
stylus = require('stylus'),
telepath = require('tele'),
fs = require('fs')

// PRECOMPILER
// stream output to rtr???
module.exports = function (opts) {
  telepath(this)
  
  var self = this,
  JS = '',
  destJS = './_wilds/_bundle.js',
  srcJS = ['./__clnt.js'],
  CSS = '',
  srcCSS = './_wilds/_default.styl',
  destCSS = './_wilds/_styles.css'

  this.recv = function (moduleData) {
    console.dir(JSON.parse(moduleData))
    var mod = JSON.parse(moduleData.toString())
    handleMod(mod)
  }

  function handleMod (mod) {
    if (mod.scope === 'client') 
    if (mod.scope === 'server')
    JS.push(mod.filePath)
  }

  // browserify(JS).bundle({}, makeJS)
  function makeJS (JS) {
    if (opts.compress === true) {
      var bundleMin = uglifyJS.minify(JS,{fromString: true})
      bundle = bundleMin.code
    }
    fs.writeFile(opts.destJS, JS, function (err) {
      if (err) throw err
    })
  }

  function makeCSS (err, css) {
    if (err) throw err
    var styles = data.toString()
    styles += self.css

    stylus.render(styles, {filename:destCSS}, function (err, css) {
      if (err) throw err
      fs.writeFile(destCSS, css, function (err) {
        if (err) throw err
        cb();
      })
    })
  }
}
