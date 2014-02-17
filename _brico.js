// BRICOLEUR

var conf = require('./__conf.json') 
var through = require('through')
var proc = process.title // node or browser
var interface = {}
var api

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

  var filter = {
    put: function (d) {
      var path = d.key.split(':')

    },
    del: function (d) {
      var path = d.key.split(':')

    }
  }

  var liveStream = data.liveStream({old:false}) 

  liveStream.on('data', function dataFilter {
    if (filter[d.type]) filter[d.type](d)
  })

  return api
}


interface.ls = function (result) {
  // show active modules and connections
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


api = through(function input (d) { 
  interface[d.cmd](d, function (res) {
    self.emit('data', res)
  })
}, function end () {
  this.emit('end')
}, {autoDestroy:false})
