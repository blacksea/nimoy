// PRECOMPILER FOR CLIENT : manages dependancies

var browserify = require('browserify')
, fs = require('fs')
, uglifyJS = require('uglify-js');

module.exports = function (opts) {
  var self = this;
  this.css = '';
  /* 
   opts.src = (array) mod paths to browserify
   opts.dst = (string) destination file 
   opts.css = (string) destination css
   opts.compress = (bool) minify or not
  */

  // module filtering!/processing!

  // handle css dependancies here! provide a single css loaded once ... also add gzip compression 
  // dynamic css manipulation should be done in plain js by loaded modules

  this.handleData = function (obj) { // filters here!?! allow a filter function pass through
    opts.src.push(obj.filepath);
    if(obj.css) self.css += obj.css; 
  }

  this.compile = function () {
    var data = browserify(opts.src).bundle();

    if(opts.compress===true) {
      var bundleMin = uglifyJS.minify(data,{fromString: true});
      data = bundleMin.code;
    }

    fs.writeFile(opts.dst,data,function (err) {
      if (err) throw(err);
      compileCSS();
    });

    function compileCSS () {
       fs.writeFile(opts.css, self.css,function (err) {
         if (err) throw(err);
      });
    }

  }    
  
}
