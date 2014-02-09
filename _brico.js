// BRICO


var through = require('through')
var fern = require('fern')
var proc = process.title // node or browser
var conf = require('./__conf.json') // just require config


// how to use paths
// how to interface with db / commands !?
// cli / ui 
// auth -- crypto [salted hash?! / encrypt data?!]
// abstraction ?

var filter = {
  put: {
    make: function (d) { // use path spaces : but implement correctly
      var m = d.key.split(':')[1]
      var mPath = config.dir_wilds+m
      _[m] = require(mPath)(d.value)
    },
    conn: function (d) {
    }
  },
  del: {
    make: function (d) {
      var m = d.key.split(':')[1]
      _[m].emit('close')
      delete _[m]
    },
    conn: function (d) {
    }
  }
}

module.exports.filter = filter

module.exports = function bricoleur (data) { // YES! only use db
  var _ = {}

  // resolve brico filter with paths
  // 2 spaces : live modules : connections :: link with filters
  


  // DATA
  
  var liveStream = data.liveStream({old:false}) 
  liveStream.pipe(fern(filter))


  // UTIL
  
  function search (args, cb) { // FIX!
    var match = false
    var ks = data.createKeyStream()
    ks.on('data', function (d) {
      var path = d.split(':')
      if (args[1] === path[1]) {
        match = true
        for (var i=2; i<args.length; i++) {
          var pair = args[i].split('=')
          var key = pair[0]
          var val = pair[1]
          opts[key] = val
        }
        if (opts === {}) opts = null
      }
    })
    ks.on('end', function () {
      if (match !== true) interface.emit('error', new Error('could not find module'))
    })
  }


  // INTERFACE 
  var interface = through(function write (d) {
    this.emit('data', d)
  }, function end () {
    this.emit('end')
  })
  return interface
}
