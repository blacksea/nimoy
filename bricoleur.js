var fern = require('fern')
var proc = {}
proc[process.title] = true // node or browser


module.exports = function Bricoluer (multiLevel) { 
  var muxDemux
  var index


  var _ = {} // scope for module streams

  var Wilds = fern({
    '^' : function (d, emit) {
      index = d
    },
    '_' : function (d, emit) {
      var name = getPath(d.key)[1]
    },
    '*' : function (d, emit) { 
      // key = *:name:uid | val = {pkg}
      var pkg = JSON.parse(d.value).nimoy

      if (d.type === 'put' && proc[pkg.process]) {
        d.opts  
          ? _[modName] = require(name)(d.opts) 
          : _[modName] = require(name)
      }
      if (d.type === 'del' && _[modName]) {
        _[modName].destroy()
        delete _[modName]
      }
    },
    '#' : function (d, emit) {
      // key = #:name:uid | val = [A,B]
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
  }, 
  {key:'key', sep:':', pos:0})
    .on('error', console.error)

  multiLevel.createReadStream().pipe(Wilds)
  multiLevel.liveStream({ old:false }).pipe(Wilds)


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


// Utils 
function stamp () {
  return new Date().getTime()
}
