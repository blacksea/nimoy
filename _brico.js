// BRICOLEUR


var conf = require('./__conf.json') 
var fern = require('fern')
var proc = process.title // node or browser


module.exports = function bricoleur (data, muxDemux) { 
  var _ = {} // PROCESS SCOPE

  var WILDS = {}

  function getPath (key) {
    return key.split(':')
  }

  WILDS['_'] = function (d, emit) {// _ PROCESS/storage
    var name = getPath(d.key)[1]
    var uid = getPath(d.key)[2]
    var time = getPath(d.key)[3]
    
  }

  WILDS['^'] = function (d, emit) {// ^ LIBRARY
    var context = getPath(d.key)[1]

  }

  WILDS['*'] = function (d, emit) {// * MODULE
    var name = getPath(d.key)[1]
    var uid = getPath(d.key)[2]
    var time = getPath(d.key)[3]
    var modName = name+':'+uid
    d.opts ? _[modName] = require(name)(d.opts) : _[modName] = require(name)
  }

  WILDS['#'] = function (d, emit) {// # CONNECT
    var mode = getPath(d.key)[1]
    var modA = d.conn.split('>')[0]
    var modB = d.conn.split('>')[1]
    if (d.mode == 'link') {
      modA.pipe(modB)
    } else if (d.mode == 'pipe') {
      // make a link pipe
    }
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
