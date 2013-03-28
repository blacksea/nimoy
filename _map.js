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
  this.clientMap = [];
  this.serverMap = [];

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
            obj.filepath = filepath; // add the filepath

            handleData(obj, function (newObj) {
              for (var x=0;x<newObj.scope.length;x++) {
                self[newObj.scope[x]+'Map'].push(newObj);
                self[newObj.scope[x]].emit('data', newObj);
              }
              cb();
            });

            break;
          }
        
        }
      });
    } else cb();
  }

  function handleData (obj, cb) {

    if (obj.deps) { 
      async.forEach(obj.deps, handleDep, function () {
        cb(obj);
      });
    } else if (!obj.deps) {
      cb(obj);
    }

    function handleDep (file, cb) {

      var ext = file.split('.')[1];

      fs.readFile('./_wilds/'+file, function (err, content) {
        if (err) throw err;
        var str = content.toString();
        obj[ext] = str; // add html/styl/css key with file content as value
        cb();
      });

    }
  }
}
