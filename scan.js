/* S C A N N E R
- scan
- get data
- add to map -- array? obj?
-- first just return a simple object and provide basic options
-- module - scope -  
--
*/

var fs = require('fs');
module.exports = function (opts) {
  var self = this;
  if (!opts) { 
    var opts = {
      fileType : ['js'],
      dir : './_components'
    }
  }
  self.scan = function (cb) { 
    fs.readdir(opts.dir, function (err, files) {
      for(var i=0;i<files.length;i++){ 
        var ext = files[i].split('.');
        if(ext[0]!='.'&& ext[1]==='js') { // ignore hidden files
          oggle(files[i], function (err, json){
            if(err) console.log(err);
            if(err===null) cb(json);
          });
        }
      }
    });	
  }
  function oggle (file, cb) { // grab the file desc json -- check against options
    var fileStream = fs.createReadStream(opts.dir+'/'+file);
    fileStream.on('data', function (data) { // fix this stream
      var buf = data.toString();
      var json = '';
      var err = 'ERR no info available in: '+file;
      for(var i=0;i<buf.length;i++){
        json += buf[i];
        if(buf[i]==='{'&&json=='/*{') err = null;
        if(buf[i]==='}'&&err===null) {
          json = JSON.parse(json.replace('/*',''));
          if (typeof json === 'object') cb(null, json);
          break;
        }
      }
      if(err!=null&&err!='undefined') cb(err);
    });
  }
} 
