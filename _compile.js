// C O M P I L E R
var browserify = require('browserify')
, fs = require('fs')
, uglifyJS = require('uglify-js');
module.exports = function (fileArray,dst) {
  var bundle = browserify(fileArray).bundle();
  var bundleMin = uglifyJS.minify(bundle,{fromString: true});
  fs.writeFile(dst,bundleMin.code,function (err) {
    if(err) console.log(err);
  }
}

