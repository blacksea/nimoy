/* P R O V I S I O N E R
*/

var browserify = require('browserify')
, fs = require('fs')
, uglifyJS = require('uglify-js');
module.exports = function (opts) {
  // if (!opts) throw err;
  var bundle = browserify(opts.src).bundle();
  var data = {code:bundle};
  if(opts.compress===true) data = uglifyJS.minify(bundle,{fromString: true});
  fs.writeFile(opts.dst,data.code,function (err) {
    //fs.writeFile(dst,bundleMin.code,function (err) {
    if(err) throw(err);
    console.log('compile done');
  });
}

