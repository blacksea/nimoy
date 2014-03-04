// BRICOLEUR

var conf = require('./__conf.json') 
var fern = require('fern')
var proc = process.title // node or browser

module.exports = function Bricoluer (multiLevel) { 
  var muxDemux
  var _ = {} // PROCESS SCOPE

  var WILDS = {}

  WILDS['_'] = function (d, emit) {// _ GHOST SPACE 
    var name = getPath(d.key)[1]

    // val / opts ?

    // keyspace for ghost/data modules
    // manage like regular modules but with pipes into db
    // make a new stream to db and pipe into module
    // sublevels?
    
  }

  WILDS['^'] = function (d, emit) {// ^ LIBRARY
    var context = getPath(d.key)[1]

    // create index for Api functions and other Wilds fns
   
  }

  WILDS['*'] = function (d, emit) {// * MODULE

    // PUT
    // check mod proc
    // check active proc
    // require & call fn with opts
    // if err emit err

    // check pipe links
    
    var name = getPath(d.key)[1]
    var uid = getPath(d.key)[2]
    var time = getPath(d.key)[3]
    var modName = name+':'+uid
    if (d.type === 'put') {
      d.opts ? _[modName] = require(name)(d.opts) : _[modName] = require(name)
    } else if (d.type === 'del') {
      delete _[modName] 
    }
  }

  WILDS['#'] = function (d, emit) {// # CONNECT

    // get module pkgs from index
    // t off streams?
    // should be pkgs
    
    var modA = {}
    var modB = {}

    // PUT
    // check mod proc      
    // check active proc
    // make mxdx s & pipe
    // or just pipe
    // if errs emit err
    
    // DEL
    // unpipe mode
    // destroy streams
    // if err emit err
    
    if (proc==='browser') {
      mxdx.on('connection', function (s) {
        s.on('data', console.log)
        s.on('error', console.error)
        window.thru = s
      }) 
    } else if (proc==='node') {
      var t = mxdx.createStream('thru')
      t.on('data', console.log)
      t.on('error', console.error)
    }
    
    var mode = getPath(d.key)[1]
    var modA = d.conn.split('>')[0]
    var modB = d.conn.split('>')[1]
    if (d.mode == 'pipe') {
      modA.pipe(modB)
    } else if (d.mode == 'pipe') {
      // make a link pipe
    }
  }


  var wilds = fern(WILDS,{key:'key', sep:':', pos:0})
  wilds.on('error', console.error)

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

  
  // UTILS
  
  function getPath (key) {
    return key.split(':')
  }
} 
