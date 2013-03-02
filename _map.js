// MAPPER

var fs = require('fs')
, Stream = require('stream')
, async = require('async');

module.exports = function (dir) {
  var self = this;
  this.scan = new Stream();
  this.scan.readable = true;

  fs.readdir(dir, function (err, files) { // read dir!
    if(err) throw err;
    async.forEach(files, readFile, function (err) {
      if(err===null) return self;
      if(err) throw err;
    });
  }); 

  function readFile (file, cb) { 
    var ext = file.split('.');
    if(ext[1]==='js'&&ext[0]!==''){ // ignore hidden and non js files
      var fileStream = fs.createReadStream(dir+'/'+file);
      fileStream.on('data', function (rawdata) {
        var data = rawdata.toString()
        , buf = '';
        for (var i=0;i<data.length;i++) {
          buf += data[i];
          if(data[i]==='}') {
            var obj = JSON.parse(buf.replace('/*','')); 
            self.scan.emit('data', obj);
            cb();
            break;
          }
        }
      });
    } else cb();
  }
}

// apply some filters!?
