var fern = require('fern')
var through = require('through')
var proc = process.title

function Bricoleur (multiLevel, opts) { 

  var self = this
  var muxDemux 
  var hotModule
  var index

  var _ = {}
  this._ = _


  var Wilds = fern({

    '^' : function (d) { 

      index = JSON.parse(d.value)
      
    },

    '_' : function (d) {

      // access db!!!!

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
            var s = self.muxDemux.createStream(conn)
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


  function newMuxConn (s) {
    if (s.meta === hotModule.conn) {
     (hotModule.pos === 0)
       ? _[hotModule.uid].pipe(s)
       : s.pipe(_[hotModule.uid])
    }
  }

  this.installMuxDemux = function (mxdx) {
    muxDemux = mxdx
    if (proc === 'browser') muxDemux.on('connection', newMuxConn)
  } 

  var api = through(function Write (d) {
    var cmd

    if (typeof d === 'string') cmd = d.split(' ')

    if (cmd.length === 1) {

      if (cmd[0].match(/\|/)) { // pipe
        var name = cmd[0]
        var uid = new Date().getTime()
        var key = '#:'+name+':'+uid
        var value = cmd[0]
        multiLevel.put(key, value, handleRes)      
      }

      if (cmd[0].match('-') !== null) { // unpipe
        multiLevel.del(cmd[0], handleRes)
      }

      if (cmd[0] === 'ls')  {
        // create active map --- write stream of active modules
      }

    } 

    if (cmd[0] === 'put') {
      var name = cmd[1]
      var uid = new Date().getTime()
      var key = '*:'+name+':'+uid

      var value = (!cmd[2]) 
        ? {}
        : JSON.parse(cmd[2])

      multiLevel.put(key, value, handleRes)
    }

    if (cmd[0] === 'del') {
      var uid = cmd[1]
      multiLevel.del(key, value, handleRes)
    }

    if (cmd[0] === 'search') {
      var str = cmd[1]
      search(str, function result (e, res) {
        if (e) api.emit('error', e)
        if (!e) api.emit('data', {
          type: 'search',
          status:1,
          val: res
        })
      })
    }

  }, function End () {

    this.emit('end')

  })


  function search (str, res) {
    var result

    multiLevel.createKeyStream()
      .on('data', function (key) {
        var items = key.split(':')
        for (var i=0;i < items.length;i++) {
          if (items[i] === str) {
            result = key
            res(null, result)
            break;
          }
        }
      })
      .on('close', function () {
        if (!result) res(new Error('not found'), null)
      })
  }


  function handleRes (e) {
    if (e) api.emit('error', e)
  }


  this.api = api

} 

module.exports = Bricoleur
