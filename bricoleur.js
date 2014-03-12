var fern = require('fern')


function Bricoluer (multiLevel) { 

  var proc = process.title
  var hotModule
  var index
  var _ = {} 

  this.muxDemux = null  

  var Wilds = fern({

    '^' : function (d) { 

      index = d

    },

    '_' : function (d) {

    },

    '*' : function (d) {

      var name = d.key.split(':')[1]
      var uid = d.key.split(':')[2]
      var modName = name +'_'+uid
      var pkg = index[name].nimoy
      var opts = JSON.parse(d.value)

      if (d.type === 'put' && proc === pkg.process) {
        opts
          ? _[modName] = require(name)(opts) 
          : _[modName] = require(name)
        Api.emit({status:1})
      }
      if (d.type === 'del' && _[modName]) {
        _[modName].destroy()
        delete _[modName]
        Api.emit({status:1})
      }

    },

    '#' : function (d) {

      var conn = d.value
      var mods = conn.split('_')

      mods.map(function getPkgs (uid, i, a) {
          var name = uid.split('_')[0]
          var pkg = index[name].nimoy
          pkg.uid = uid
          pkg.pos = i
          return pkg
      })

      if (mods[0].process !== mods[1].process) {
        mods.forEach(function (m) {
          var p = m.process
          if (p === 'node') {
            var s = muxDemux.createStream(conn)
            m.pos === 0
              ? _[m.uid].pipe(s)
              : s.pipe(_[m.uid])
          }
          if (p === 'browser') {
            hotModule = m
            hotModule.conn = conn
          }
        })
      } else {
        _[mods[0].uid].pipe(_[mods[1].uid])
        Api.emit({status:1})
      }
    }

  }, 
  { filter:'key', sep:':', pos:0 })
    .on('error', console.error)


  multiLevel.createReadStream().pipe(Wilds)
  multiLevel.liveStream({ old:false }).pipe(Wilds)


  if (proc === 'browser') muxDemux.on('connection', newMuxConn)

  function newMuxConn (s) {
    if (s.meta === hotModule.conn) {
      (hotModule.pos === 0)
        ? _[hotModule.uid].pipe(s)
        : s.pipe(_[hotModule.uid])
    }
  }
} 

Bricoleur.prototype.installMuxDemux = function (mxdx) {
  this.muxDemux = mxdx
} 

module.exports = Bricoleur
