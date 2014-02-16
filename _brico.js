// BRICO

var through = require('through')
var conf = require('./__conf.json') 
var proc = process.title // node or browser


module.exports = function bricoleur (data) { 

  var WILDS = {}

  WILDS['*'] = function (i,o) { // * MODULE

  }
  WILDS['^'] = function (i,o) { // ^ LIBRARY

  }
  WILDS['#'] = function (i,o) { // # CONNECT

  }
  WILDS['_'] = function (i,o) { // _ PROCESS

  }


  var filter = {
    put: function (d) {
      var path = d.key.split(':')

    },
    del: function (d) {
      var path = d.key.split(':')

    }
  }

  function dataFilter (d) { 
    if (filter[d.type]) filter[d.type](d)
  }

  var liveStream = data.liveStream({old:false}) 
  liveStream.on('data', dataFilter)


  var interface = {}
  interface.search = search

  var api = through(function write (d) { // what input?
    interface[d.cmd](d, function (res) {
      self.emit('data', res)
    })
  }, function end () {
    this.emit('end')
  }, {autoDestroy:false})

  return api
}

function search (pattern, result) {
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
