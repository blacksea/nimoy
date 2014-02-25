// BRICOLEUR


var conf = require('./__conf.json') 
var fern = require('fern')
var proc = process.title // node or browser

module.exports = function Bricoluer (data) { 
  var muxDemux
  var _ = {} // PROCESS SCOPE

  var WILDS = {}

  function getPath (key) {
    return key.split(':')
  }

  WILDS['_'] = function (d, emit) {// _ PROCESS/storage keyspace, but how to access?
    var name = getPath(d.key)[1]
    // keyspace for ghost/data modules
    // manage like regular modules but with pipes into db
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

    var name = getPath(d.key)[1]
    var uid = getPath(d.key)[2]
    var time = getPath(d.key)[3]
    var modName = name+':'+uid
    d.opts ? _[modName] = require(name)(d.opts) : _[modName] = require(name)
  }

  WILDS['#'] = function (d, emit) {// # CONNECT

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
    
    // if (proc==='browser') {
    //   mxdx.on('connection', function (s) {
    //     console.log(s)
    //     s.on('data', console.log)
    //     s.on('error', console.error)
    //     window.thru = s
    //   }) 
    // }
    // if (proc==='node') {
    //   var t = mxdx.createStream('thru')
    //   t.on('data', console.log)
    //   t.on('error', console.error)
    //     setTimeout(function () {
    //       t.write('toe')
    //     },300)
    // }
    
    var mode = getPath(d.key)[1]
    var modA = d.conn.split('>')[0]
    var modB = d.conn.split('>')[1]
    if (d.mode == 'pipe') {
      modA.pipe(modB)
    } else if (d.mode == 'pipe') {
      // make a link pipe
    }
  }


  var LevelDataStream = data.liveStream({ old:false }) 
  LevelDataStream.pipe(fern(WILDS, {type:'key', sep:':', pos:0}))


  var Api = fern({
    put: function (opts, emit) {
      // make key string & pass in opts
      data.put(key, val, function (e) {
          
      })
    },
    del: function (opts, emit) {
      data.del(key, function (e) {

      })
    },
    search : function (opts, emit) {

      var res = []
      var ks = data.createKeyStream()

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
