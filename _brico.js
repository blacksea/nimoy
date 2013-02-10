/* B R I C O L E U R 
 intelligent collager
*/

var MuxDemux = require('mux-demux')
, async = require('async');

module.exports = function (dir) {
  var self = this;
  self.init = function (json) { // a set of props

  }
  /////////////////////////
  self.stream = MuxDemux();
  self.stream.on('connection', function (stream) {
    stream.on('data', function (data) { // hook / pipe stream from here
      // console.log(stream.meta+' '+data);
    });
  /////////////////////////
  });
}
