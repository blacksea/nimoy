// MAPPER

var fs = require('fs')
, Stream = require('stream')
, async = require('async');

module.exports = function (dir) {
  var self = this;
  this.client = new Stream();
  this.server = new Stream();
  this.client.readable = true;
  this.server.readable = true;

  fs.readdir(dir, function (err, files) { 
    if(err) throw err;
    async.forEach(files, streamFileData, function () {
      self.server.emit('end');
      self.client.emit('end');
    });
  });

  function streamFileData (file, cb) { 
    var ext = file.split('.');
    if(ext[1]==='js'&&ext[0]!==''){ // ignore hidden and non js files
      var filepath = dir+'/'+file
      , fileStream = fs.createReadStream(filepath);
      fileStream.on('data', function (rawdata) {
        var data = rawdata.toString()
        , buf = '';
        for (var i=0;i<data.length;i++) {
          buf += data[i];
          if(data[i]==='}') {
            var obj = JSON.parse(buf.replace('/*','')); 
            obj.filepath = filepath; // add the filepath + check for deps. like html
            for (var x=0;x<obj.scope.length;x++) {
              self[obj.scope[x]].emit('data', obj);
            }
            cb();
            break;
          }
        }
      });
    } else cb();
  }

  function getHtml(file, cb) {
    fs.readFile(file, function(data) {
      var html = data.toString();
    });
  }

}
