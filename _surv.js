// S U R V E Y O R 
var fs = require('fs')
, async = require('async');

module.exports = function (opts) {
  var self = this
  , map = [];
  if (!opts) { 
    opts = {
      fileType : ['js'],
      dir : './_components'
    }
  }
  this.scan = function (cb) { 
    fs.readdir(opts.dir, function (err, files) {
      async.forEach(files, oggle, function (err) {
        if(err) throw err;
        if(err===null) cb(map);
      });
    });	
  }
  function oggle (file, cb) { 
    var ext = file.split('.');
    if(ext[0]!='.' && ext[1]==='js') { // exclude hidden files & non js files
      var fileStream = fs.createReadStream(opts.dir+'/'+file);
      fileStream.on('readable', function () {
        var data = fileStream.read().toString();
        var buf = '';
        for (var i=0; i<data.length; i++) {
          buf += data[i];
          if(data[i]==='}') {
            var obj = JSON.parse(buf.replace('/*',''));
            if (typeof obj === 'object') map.push(obj);
            cb();
            break;
          }
        }
      });
    } else cb();
  }
} 
