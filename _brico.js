// BRICOLEUR


var conf = require('./__conf.json') 
var fern = require('fern')
var proc = process.title // node or browser

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


  var Filter = fern({
    put: function (d) {
      var path = d.key.split(':')

    },
    del: function (d) {
      var path = d.key.split(':')

    }
  })

  var LevelDataStream = data.liveStream({old:false}) 

  LevelDataStream.pipe(Filter)


  var Api = fern({
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
    }, 
    ls : {

    }
  })

  return Api
}
