// PRECOMPILER FOR CLIENT : manages dependancies

var browserify = require('browserify'),
fs = require('fs'),
stylus = require('stylus'),
uglifyJS = require('uglify-js')

exports = function (stream) {
  var _ = this,
  destJS = './_wilds/bundle.js',
  destCSS = './_wilds/styles.css'

  stream.on('data', function (data) {
    
  })

  stream.on('end', function () {
    browserify(JS).bundle({}, makeJS)

    fs.readFile(CSS, makeCSS)

    function makeJS (err, JS) {
      if (err) throw err
      if (_.compress===true) {
        var bundleMin = uglifyJS.minify(JS,{fromString: true})
        bundle = bundleMin.code
      }
      fs.writeFile(destJS, JS, function (err) {
        if (err) throw err
      })
    }
// test
    function makeCSS (err, css) {
      if (err) throw err
      var styles = data.toString(),
      styles += self.css
      stylus.render(styles, {filename:destCSS}, function (err, css) {
        if (err) throw err
        fs.writeFile(destCSS, css, function (err) {
          if (err) throw err
          cb();
        })
      })
    }
  })

