// PRECOMPILER FOR CLIENT : manages dependancies

var browserify = require('browserify')
, fs = require('fs')
, stylus = require('stylus')
, uglifyJS = require('uglify-js');

module.exports = function (opts) {
  var self = this;
  this.css = '';

  /* 
   opts.src = (array) mod paths to browserify
   opts.dst = (string) destination file 
   opts.srcCSS = (string) src css
   opts.dstCSS = (string) destination css
   opts.compress = (bool) minify or not
  */

  // handle css dependancies here! provide a single css loaded once ... also add gzip compression 
  // dynamic css manipulation should be done in plain js by loaded modules

  this.handleData = function (obj) { // filters here!?! allow a filter function pass through
    opts.src.push(obj.filepath);
    if(obj.styl) self.css += obj.styl; 
  }

  this.compile = function () {
    browserify(opts.src).bundle({}, function (err, data) {
      if(opts.compress===true) {
        var bundleMin = uglifyJS.minify(data,{fromString: true});
        data = bundleMin.code;
      }
      fs.writeFile(opts.dst,data,function (err) {
        if (err) throw(err);
        compileCSS();
      });
      function compileCSS () {
        fs.readFile(opts.srcCSS, function (err, data) {
          if (err) throw err;
          var styles = data.toString();
          styles += self.css;
          stylus.render(styles, {filename:opts.dstCSS}, function (err, css) {
            if (err) throw err;
            fs.writeFile(opts.dstCSS, css, function (err) {
              if(err) throw err;
            });
          });
       });
      }
    });
  }    
}
