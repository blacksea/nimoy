/* B R I C O L E U R 
 intelligent collager
*/
var MuxDemux = require('mux-demux')
, async = require('async');
module.exports = function (dir) {
  var self = this;
  this.init = function (map) { // a set of props
    console.log(map);
  }
  /////////////////////////
  this.stream = MuxDemux();
  this.stream.on('connection', function (stream) {
    stream.on('data', function (data) { // hook / pipe stream from here
      // console.log(stream.meta+' '+fillibuster);
    });
  /////////////////////////
  });
}
