/* B R I C O L E U R 
post apocalyptic bricoleur
scans a dir for useful components
can crawl subdirs as well
grabs json or js files
if js file expects top of file to be a comment containing json
*/

var fs = require('fs')
, async = require('async');

module.exports = function (dir) {
  var self = this;
  fs.readdir(dir, function (err, files) {
    for(var i=0;i<files.length;i++){ 
      var ext = files[i].split('.');
      if( ext[0]!='' && ext[1] == 'js' || ext[1]=='json' ) { // add ability to read subdirs 
        oggle(files[i], function (err, json){
          if(err) console.log(err);
          if(!err) console.log(json);
        });
      }
    }
  });	
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
