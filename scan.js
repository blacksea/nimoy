/* S C A N N E R
scan and pull meta data
create a file map in json ?!? form ?
accepts options object
*/

var fs = require('fs');
module.exports = function (options, cb) {

  function scan(dir) { 
    fs.readdir(dir, function (err, files) {
      for(var i=0;i<files.length;i++){ 
        var ext = files[i].split('.');
        if(ext[0]!='.'&& ext[1]==='js'||ext[1]==='json') { // ignore hidden files
          oggle(files[i], function (err, json){
            if(err) console.log(err);
            if(!err) console.log(json);
          });
        }
      }
    });	
  }

  function oggle (file, cb) { // grab the file desc json
    var fileStream = fs.createReadStream(dir+'/'+file);
    fileStream.on('data', function (data) { // fix this stream
      var buf = data.toString();
      var json = '';
      var err = 'ERR no info available in: '+file;
      for(var i=0;i<buf.length;i++){
        json += buf[i];
        if(buf[i]==='{'&&json=='/*{') err = null;
        if(buf[i]==='}'&&err===null) {
          json = JSON.parse(json.replace('/*',''));
          if (typeof json != 'object') // throw err;
          cb(err, json);
          break;
        }
      }
      if(err!=null) cb(err);
    });
  }
} 
