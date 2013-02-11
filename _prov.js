/* P R O V I S I O N E R
*/

var browserify = require('browserify')
, fs = require('fs')
, uglifyJS = require('uglify-js');
module.exports = function (opts) {
  // if (!opts) throw err;
  var bundle = browserify(opts.in).bundle();
  var data = bundle;
  if(opts.compress===true) data = uglifyJS.minify(bundle,{fromString: true});
  fs.writeFile(opts.out,data,function (err) {
  //fs.writeFile(dst,bundleMin.code,function (err) {
    if(err) throw(err);
    console.log('compile done');
  });
}

