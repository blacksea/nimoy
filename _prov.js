// P R O V I S I O N E R
var browserify = require('browserify')
, fs = require('fs')
, uglifyJS = require('uglify-js');

module.exports = function (opts, cb) {
  var data = browserify(opts.src).bundle();
  if(opts.compress===true) {
    var bundleMin = uglifyJS.minify(data,{fromString: true});
    data = bundleMin.code;
  }
  fs.writeFile(opts.dst,data,function (err) {
    if(err) throw(err);
    cb('compile done');
  });
}

