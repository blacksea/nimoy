// BRICOLEUR

var conf = require('./__conf.json') 
var through = require('through')
var proc = process.title // node or browser
var fern = require('fern')
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


  var Filter = {
    put: function (d) {
      var path = d.key.split(':')

    },
    del: function (d) {
      var path = d.key.split(':')

    }
  }
  var LevelDataStream = data.liveStream({old:false}) 
  LevelDataStream.pipe(fern(Filter))


  var Api = {
    search : function () {
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
  }

  return fern(Api)
}
