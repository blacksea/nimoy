var fern = require('fern')
var proc = {}
proc[process.title] = true // node or browser

module.exports = function Bricoluer (multiLevel) { 
  var muxDemux
  var index
  var _ = {} // PROCESS SCOPE

  var WILDS = {}

  WILDS['^'] = function (d, emit) {// ^ LIBRARY
    index = d
  }

  WILDS['_'] = function (d, emit) {// _ GHOST SPACE 
    // key = _:name
    var name = getPath(d.key)[1]

    // makes a duplex stream -- bridges to db or mxdx -- use a sublevel?
  }

  WILDS['*'] = function (d, emit) {// * MODULE
    // key = *:name:uid:time | val = {pkg}
    var name = getPath(d.key)[1]
    var uid = getPath(d.key)[2]
    var time = getPath(d.key)[3]
    var modName = name+':'+uid
    var pkg = JSON.parse(d.value).nimoy

    if (proc[pkg.process]) {
      if (d.type==='put') 
        d.opts ? _[modName] = require(name)(d.opts) : _[modName] = require(name)
      if (d.type==='del')
        _[modName].destroy() // destroy stream
        delete _[modName]
    }
  }

  WILDS['#'] = function (d, emit) {// # CONNECT
    // key = #:name:uid:time | val = [A,B]
    var A = d.value[0]
    var B = d.value[1]
    var mode = getPath(d.key)[1]
    var modA = d.conn.split('>')[0]
    var modB = d.conn.split('>')[1]

    if (proc.browser) {
      mxdx.on('connection', function (s) {
        s.on('data', console.log)
        s.on('error', console.error)
        window.thru = s
      }) 
    }

    if (proc.node) {
      var t = mxdx.createStream('thru')
      t.on('data', console.log)
      t.on('error', console.error)
    }
  }


  var wilds = fern(WILDS,{key:'key', sep:':', pos:0})
  wilds.on('error', function (e) {
    console.error(e)
  })
  
  multiLevel.createReadStream().pipe(wilds)

  var LevelDataStream = multiLevel.liveStream({ old:false }) 
  LevelDataStream.pipe(wilds)

  var Api = fern({
    put: function (opts, emit) {
      // make key string & pass in opts
      multiLevel.put(key, val, function (e) {
          
      })
    },
    del: function (opts, emit) {
      multiLevel.del(key, function (e) {

      })
    },
    search : function (opts, emit) {
      var res = []
      var ks = multiLevel.createKeyStream()

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
  })

  Api.installMuxDemux = function (mxdx) {
    muxDemux = mxdx
  }

  return Api
  
} 
