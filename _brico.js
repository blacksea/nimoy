/* B R I C O L E U R 
post apocalyptic bricoleur
traverse or filter file map
grabs json or js files
if js file expects top of file to be a comment containing json
*/

var MuxDemux = require('mux-demux')
, async = require('async');

module.exports = function (dir) {
  var self = this;
  self.stream = MuxDemux();
  self.stream.on('connection', function (stream) {
    stream.on('data', function (data) { // hook / pipe stream from here
      // allow new streams now
      // console.log(stream.meta+' '+data);
    });
  });
}
