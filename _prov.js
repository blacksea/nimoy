/* P R O V I S I O N E R
*/

var browserify = require('browserify')
, fs = require('fs')
, uglifyJS = require('uglify-js');
module.exports = function (fileArray,dst) {
  var bundle = browserify(fileArray).bundle();
  var bundleMin = uglifyJS.minify(bundle,{fromString: true});
  fs.writeFile(dst,bundle,function (err) {
  //fs.writeFile(dst,bundleMin.code,function (err) {
    if(err) throw(err);
    console.log('compile done');
  });
}

