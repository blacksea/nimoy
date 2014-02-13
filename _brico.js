// BRICO

var through = require('through')
var fern = require('fern')
var conf = require('./__conf.json') 
var proc = process.title // node or browser
var interface

// abstraction layer
interface = through(function write (d) { 

}, function end () {
  this.emit('end')
}, {autoDestroy:false})

module.exports = function bricoleur (data) { 

  var WILDS = {}

  WILDS['*'] = function (i,o) { // * MODULE

  }
  WILDS['^'] = function (i,o) { // ^ LIBRARY

  }
  WILDS['#'] = function (i,o) { // # CONNECT

  }
  WILDS['_'] = function (i,o} { // _ PROCESS

  }

  var liveStream = data.liveStream({old:false}) 
  liveStream.on('data', handleData)

  function handleData (d) {
    if(filter[d.type]) filter[d.type](d)  
  }

  var filter = {
    put: function (d) {
      var path = d.key.split(':')

    },
    del: function (d) {
      var path = d.key.split(':')

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
