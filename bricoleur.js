var fern = require('fern')


function Bricoleur (multiLevel, opts) { 

  var self = this
  var proc = process.title
  var hotModule
  var index

  var _ = {}
  this._ = _
  var muxDemux
  this.muxDemux = muxDemux


  var Wilds = fern({

    '^' : function (d) { 

      index = JSON.parse(d.value)
      
    },

    '_' : function (d) {

    },

    '*' : function (d) {

      var name = d.key.split(':')[1]
      var uid = d.key.split(':')[2]
      var modName = name +'_'+uid
      var pkg = index[name].nimoy

      if (d.type === 'put' && proc === pkg.process) {
        d.value
          ? _[modName] = require(opts.wilds+name)(d.value) 
          : _[modName] = require(opts.wilds+name)
      }
      if (d.type === 'del' && _[modName]) {
        _[modName].destroy()
        delete _[modName]
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
      }
    }

  }, 
  { filter:'key', sep:':', pos:0 })
    .on('error', console.error)


  multiLevel.createReadStream({reverse:true}).pipe(Wilds)
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
