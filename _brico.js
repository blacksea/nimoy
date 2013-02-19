// B R I C O L E U R 
var MuxDemux = require('mux-demux')
, async = require('async');

module.exports = function (dir) {
  var self = this;
  var _ = function () {} // environment/global var for mods
  this.init = function (map) { // an array of objs 
    async.forEach(map, self.addModule, function () {
      console.log('modules added');
    });
  }
  this.addModule = function (module, cb) {
    _[module.id.toUpperCase()] = require(module.filepath);
    _[module.id] = new _[module.id.toUpperCase()]();
    cb();
  }
  setTimeout(function(){
    _.send.test();
  }, 3000);
  ////////////////////////////////////////////////
  this.stream = MuxDemux();
  this.stream.on('connection', function (stream) {
    stream.on('data', function (data) { // hook / pipe stream from here
      console.log(stream.meta+' '+data);
      if(stream.meta==='brico') {
        self[data[0]](data[1]);
       }
    });
  /////////////////////////////////////////////////////////////////////
  });
}
