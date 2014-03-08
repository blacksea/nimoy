var fern = require('fern')
var proc = {}
proc[process.title] = true // node or browser

module.exports = function Bricoluer (multiLevel) { 
  var muxDemux
  var index

  var _ = {} // scope for module streams


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
    var pkg = JSON.parse(d.value).nimoy

    if (proc[pkg.process]) {
      if (d.type === 'put') 
        d.opts  
          ? _[modName] = require(name)(d.opts) 
          : _[modName] = require(name)
      if (d.type === 'del')
        _[modName].destroy() // destroy stream
        delete _[modName]
    }
  }

  WILDS['#'] = function (d, emit) {// # CONNECT
    // key = #:name:uid:time | val = [A,B]
    var nodeModule
    var browserModule
    var modules = []

    d.value.forEach(function (mod) {
      var name = mod.split('parse name')
      var pkg = index[mod]
      modules.push(pkg)
    })

    if (modules[0].process !== modules[1].process) {
      for (var i=0;i<modules.length;i++) {
        var m = modules[i]

        if (proc.browser && m.process == 'browser') {
          var mod = _[m.uid]
          m.pos = i
          mxdx.on('connection', function (s) {
            if (stream.meta===uid) {
              m.pos === 0
                ? mod.pipe(s)
                : s.pipe(mod)
            }
          }) 
        }
        if (proc.node && m.process === 'node') {
          var mod = _[m.uid]
          var s = mxdx.createStream(uid)
          m.pos === '0'
            ? mod.pipe(s)
            : s.pipe(mod)
        }
      }
    } else if (proc[modules[0].process]) {
      _[d.value[0]].pipe(_[d.value[1]])
    }
  }

  var wilds = fern(WILDS,{key:'key', sep:':', pos:0})

  wilds.on('error', console.error)
  
  multiLevel.createReadStream().pipe(wilds)

  multiLevel.liveStream({ old:false }).pipe(wilds)


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
