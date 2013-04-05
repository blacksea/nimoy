// PRECOMPILER FOR CLIENT : manages dependancies

var browserify = require('browserify')
, fs = require('fs')
, stylus = require('stylus')
, uglifyJS = require('uglify-js')

var Pre = function (opts) {
  var self = this
  this.css = ''
  this.liveJS = './_wilds/_bundle.min.js'
  this.liveCSS = './_wilds/_styles.css' 

  this.handleData = function (obj) { 
    self.liveJS.push(obj.filepath)
    if(obj.styl) self.css += obj.styl 
  }

  this.compile = function (opts) {


    browserify(opts.js).bundle({}, function (err, data) {

      if(opts.compress===true) {
        var bundleMin = uglifyJS.minify(data,{fromString: true})
        data = bundleMin.code
      }

      fs.writeFile(self.liveJS,data,function (err) {
        if (err) throw(err)
        compileCSS()
      })

      function compileCSS () {
        fs.readFile(opts.css, function (err, data) {
          if (err) throw err

          var styles = data.toString()
          styles += self.css

          stylus.render(styles, {filename:self.liveCSS}, function (err, css) {
            if (err) throw err
            fs.writeFile(self.liveCSS, css, function (err) {
              if(err) throw err
            })
          })
       })
      }
    })
  }    
}

module.exports = new Pre()
