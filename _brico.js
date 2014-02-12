// BRICO

var through = require('through')
var fern = require('fern')
var conf = require('./__conf.json') 
var proc = process.title // node or browser
var interface

var WILDS = {}

WILDS['*'] = function (i,o) { // * MODULE

}
WILDS['^'] = function (i,o) { // ^ LIBRARY

}
WILDS['#'] = function (i,o) { // # CONNECT

}
WILDS['_'] = function (i,o} { // _ PROCESS

}

interface = through(function write (d) {
  var path = key.split(':')
  var space = path[0]

}, function end () {
  this.emit('end')
}, {autoDestroy:false})

module.exports = function bricoleur (data) { 
  
  var liveStream = data.liveStream({old:false}) 
  liveStream.on('data', handleData)
  function handleData (d) {
    if(filter[d.type]) filter[d.type](d)  
  }

  var filter = {
    put: function (d) {

    },
    del: function (d) {

    }
  }

  return interface
}


// UTIL

function search (args, cb) {
  var match = false
  var ks = data.createKeyStream()
  ks.on('data', function (d) {
    var path = d.split(':')
    if (args[1] === path[1]) {
      match = true
      for (var i=2; i<args.length; i++) {
        var pair = args[i].split('=')
        var key = pair[0]
        var val = pair[1]
        opts[key] = val
      }
      if (opts === {}) opts = null
    }
  })
  ks.on('end', function () {
    if (match !== true) interface.emit('error', new Error('could not find module'))
  })
}
