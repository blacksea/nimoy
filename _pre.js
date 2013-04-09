// PRECOMPILER FOR CLIENT : manages dependancies

var browserify = require('browserify')
, fs = require('fs')
, stylus = require('stylus')
, uglifyJS = require('uglify-js')

exports = function (stream) {
  var _ = this,

  stream.on('data', function (data) {

  })

  stream.on('end', function () {

  })

  browserify(_.JS).bundle({}, compile)

  function compile (bundle) {
    var JS = opts.js

    if(opts.compress===true) {
      var bundleMin = uglifyJS.minify(bundle,{fromString: true})
      bundle = bundleMin.code
    }

    fs.writeFile(destJS,bundle,function (err) {
      if (err) throw err
      fs.readFile(opts.css, writeCSS)
    })
  }

  function writeCSS (err, css) {
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
}
