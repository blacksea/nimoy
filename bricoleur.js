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

    '*' : function (d, emit) {
      var name = d.key.split(':')[1]
      var uid = d.key.split(':')[2]
      var modName = name + uid

      var pkg = JSON.parse(d.value).nimoy
      var opts = d.value

      if (d.type === 'put' && proc === pkg.process) {
        opts
          ? _[modName] = require(name)(opts) 
          : _[modName] = require(name)
      }
      if (d.type === 'del' && _[modName]) {
        _[modName].destroy()
        delete _[modName]
      }

    },

    '#' : function (d, emit) {

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

    put: function (d, emit) { // make key string & pass in opts
      var key = d.key
      var val = d.opts
      var time = new Date().getTime()
      var name = d.key.split(':')[1]
      var uid = name+time
      key += (':'+uid)

      multiLevel.put(key, val, function makeKey(e) {
        // emit somekind of object
        if (!e) emit('put object '+uid)
      })
    },

    del: function (d, emit) {
      multiLevel.del(d.key, function (e) {
        if (!e) emit('del object '+uid)
        // if (!e) emit(' // success!
      })
    },

    search : function (d, emit) {
      var res = []
      var ks = multiLevel.createKeyStream()

      ks.on('data', function (d) {
        var path = d.split(':')
        if (pattern[1] === path[1]) res.push(d) 
      })
      ks.on('end', function () {
        emit(res)
      })
    }, 

    ls : function (d, emit) {
    }
  })


  Api.installMuxDemux = function (mxdx) {
    muxDemux = mxdx
  }


  return Api
} 
