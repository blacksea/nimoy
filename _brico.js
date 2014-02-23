// BRICOLEUR


var conf = require('./__conf.json') 
var fern = require('fern')
var proc = process.title // node or browser


module.exports = function bricoleur (data) { 

  var WILDS = {}

  WILDS['_'] = function (d,o) { // _ PROCESS
    
  }
  WILDS['^'] = function (d,o) { // ^ LIBRARY

  }
  WILDS['*'] = function (d,o) { // * MODULE

  }
  WILDS['#'] = function (d,o) { // # CONNECT

  }


  var LevelDataStream = data.liveStream({ old:false }) 
  LevelDataStream.pipe(fern(WILDS, {type:'key', sep:':', pos:0}))


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
    }, 
    ls : {

    }
  }

  return fern(Api)
}
