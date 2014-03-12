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
      var modName = name +'_'+uid
      var pkg = index[name].nimoy
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

      var mods = d.value.split('|')

      mods.map(function getPkgs (uid, i, a) {
          var name = uid.split('_')[0]
          var pkg = index[name].nimoy
          pkg.uid = uid
          pkg.pos = i
          return pkg
      })

      if (mods[0].process !== mods[1].process) {
        for (var i=0;i<mods.length;i++) {
          var p = mods[i].process
          if (p === 'node') {
            var s = muxDemux.createStream(d.value)
            mods[i].pos === 0
              ? _[mods[i].uid].pipe(s)
              : s.pipe(_[mods[i].uid])
          }
          if (p === 'browser') {
            hotModule = mods[i]
            hotModule.conn = d.value
          }
        }
      } else {
        _[mods[0].uid].pipe(_[mods[1].uid])
      }
    }

  }, 
  { filter:'key', sep:':', pos:0 })
    .on('error', console.error)


  multiLevel.createReadStream().pipe(Wilds)
  multiLevel.liveStream({ old:false }).pipe(Wilds)


  var Api = fern({

    put: function (d, emit) { // make key string & pass in opts

      var key = d.key
      var time = new Date().getTime()
      var name = d.key.split(':')[1]
      var uid = name+time
      key += (':'+uid)

      multiLevel.put(key, d.value, function (e) {
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

  if (proc === 'browser') muxDemux.on('connection', newMuxConn)

  function newMuxConn (s) {
    if (s.meta === hotModule.conn) {
      (hotModule.pos === 0)
        ? _[hotModule.uid].pipe(s)
        : s.pipe(_[hotModule.uid])
    }
  }


  return Api
} 
