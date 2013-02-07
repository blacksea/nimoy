// C O M P I L E R
var browserify = require('browserify')
, fs = require('fs')
, uglifyJS = require('uglify-js');
module.exports = function (fileArray,dst,cb) {
  var bundle = browserify(fileArray).bundle();
  console.log(bundle);
  var bundleMin = uglifyJS.minify(bundle,{fromString: true});
  console.log(bundleMin);
  fs.writeFile(dst,bundleMin.code,function (err) {
    if(err) cb(err);
  });
  // browserify + compile!!!
}
