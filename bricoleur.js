var fern = require('fern')


module.exports = function Bricoluer (multiLevel) { 
  var proc = process.title
  var hotModule
  var muxDemux
  var index
  var _ = {} 


  var Wilds = fern({

    '^' : function (d, emit) { 

      index = d

    },

    '_' : function (d, emit) {

      var name = getPath(d.key)[1]

    },

    '*' : function (d, emit) { // key= *:name:uid | val = {pkg}

      var pkg = JSON.parse(d.value).nimoy

      if (d.type === 'put' && proc === pkg.process) {
        d.opts  
          ? _[modName] = require(name)(d.opts) 
          : _[modName] = require(name)
      }
      if (d.type === 'del' && _[modName]) {
        _[modName].destroy()
        delete _[modName]
      }

    },

    '#' : function (d, emit) { // key= #:name:uid | val = [A,B]

      var modules = []
      var useMuxDemux

      if (modA.process !== modB.process) useMuxDemux = true

      if (useMuxDemux) {
        if (proc === 'browser') hotModule = module
        if (proc === 'node') muxDemux.createStream(uid).pipe(module)
      } else {
        _[modA.uid].pipe(_[modB.uid])
      }

    }

  }, 
  { filter:'key', sep:':', pos:0 })
    .on('error', console.error)


  multiLevel.createReadStream().pipe(Wilds)
  multiLevel.liveStream({ old:false }).pipe(Wilds)


  if (proc === 'browser') muxDemux.on('connection', newMuxConn)

  function newMuxConn (s) {
    (hotModule.pos === 0)
      ? _[hotModule.uid].pipe(s)
      : s.pipe(_[hotModule.uid])
  }


  var Api = fern({

    put: function (opts, emit) { // make key string & pass in opts
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
