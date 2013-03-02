// PRECOMPILER FOR CLIENT : manages dependancies
var browserify = require('browserify')
, fs = require('fs')
, uglifyJS = require('uglify-js');

module.exports = function () {
  /* 
    opts.src = (array) mod paths to browserify
    opts.dst = (string) destination file 
    opts.compress = (bool) minify or not
  */
  this.handleData = function (data) {
    console.dir(data);
  }
  // var data = browserify(opts.src).bundle();
  // if(opts.compress===true) {
  //   var bundleMin = uglifyJS.minify(data,{fromString: true});
  //   data = bundleMin.code;
  // }
  // fs.writeFile(opts.dst,data,function (err) {
  //   if(err) throw(err);
  //   cb('bundle compiled');
  // });
}

