// BRICOLEUR


var conf = require('./__conf.json') 
var fern = require('fern')
var proc = process.title // node or browser


module.exports = function bricoleur (data) { 
  var _ = {} // PROCESS SCOPE

  var WILDS = {}

  function getPath (key) {
    return key.split(':')
  }

  WILDS['_'] = function (d,o) { // _ PROCESS
    var name = getPath(d.key)[1]
    var uid = getPath(d.key)[2]
    var time = getPath(d.key)[3]
    
  }
  WILDS['^'] = function (d,o) { // ^ LIBRARY
    var context = getPath(d.key)[1]

  }
  WILDS['*'] = function (d,o) { // * MODULE
    var name = getPath(d.key)[1]
    var uid = getPath(d.key)[2]
    var time = getPath(d.key)[3]


  }
  WILDS['#'] = function (d,o) { // # CONNECT
    var mode = getPath(d.key)[1]
    var uid = getPath(d.key)[2]
    var time = getPath(d.key)[3]


  }


  var LevelDataStream = data.liveStream({ old:false }) 
  LevelDataStream.pipe(fern(WILDS, {type:'key', sep:':', pos:0}))


  var Api = {
    put: function (opts, emit) {
      // make key string & pass in opts
      data.put(key, val, function (e) {
          
      })
    },
    del: function (opts, emit) {
      data.del(key, function (e) {

      })
    },
    search : function (opts, emit) {

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
    ls : function (opts, emit) {

    }
  }

  return fern(Api)
}
