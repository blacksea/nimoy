// BRICOLEUR

var conf = require('./__conf.json') 
var through = require('through')
var proc = process.title // node or browser
var interface = {}

module.exports = function bricoleur (data) { 

  var WILDS = {}

  WILDS['_'] = function (i,o) { // _ PROCESS

  }
  WILDS['^'] = function (i,o) { // ^ LIBRARY

  }
  WILDS['*'] = function (i,o) { // * MODULE

  }
  WILDS['#'] = function (i,o) { // # CONNECT

  }


  var liveStream = data.liveStream({old:false}) 

  liveStream.on('data', function dataFilter (d) {
    if (filter[d.type]) filter[d.type](d)
  })

  var filter = {
    put: function (d) {
      var path = d.key.split(':')

    },
    del: function (d) {
      var path = d.key.split(':')

    }
  }


  interface.ls = function (result) { // show active modules and connections
    for (module in WILDS['_']) { 

    }
  }
  interface.search = function (pattern, result) {
    var res = []
    var ks = data.createKeyStream()
    ks.on('data', function (d) {
      var path = d.split(':')
      if (pattern[1] === path[1]) res.push(d) 
    })
    ks.on('end', function () {
      result(res)
    })
  }


  // STREAM --> EVENT EMITTER
 
  var api = through(function input (d) { 
    var self = this
    // interface[d.cmd](d, function (res) {
    //   self.emit('data', res)
    // })
  }, function end () {
    this.emit('end')
  }, {autoDestroy:false})

  return api
}
