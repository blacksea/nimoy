// BRICO

var through = require('through')
var conf = require('./__conf.json') 
var proc = process.title // node or browser


module.exports = function bricoleur (data) { 
  var api
  var WILDS = {}


  WILDS['*'] = function (i,o) { // * MODULE

  }
  WILDS['^'] = function (i,o) { // ^ LIBRARY

  }
  WILDS['#'] = function (i,o) { // # CONNECT

  }
  WILDS['_'] = function (i,o) { // _ PROCESS

  }


  var interface = {
    put: function (d) {
      var path = d.key.split(':')

    },
    del: function (d) {
      var path = d.key.split(':')

    },
    utils: {}
  }

  interface.utils.search = search


  function dataFilter (d) { 
    if (filter[d.type]) filter[d.type](d)
  }

  var liveStream = data.liveStream({old:false}) 
  liveStream.on('data', dataFilter)


  api = through(function write (d) { // what input?
  }, function end () {
    this.emit('end')
  }, {autoDestroy:false})

  return api
}

function search (i, o) {
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
    if (match !== true) 
      interface.emit('error', new Error('could not find module'))
  })
}
