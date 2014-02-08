// BRICO


var through = require('through')
var fern = require('fern')
var proc = process.title // node or browser

var filter = {
  put: {
    make: function (d) {
      var m = d.key.split(':')[1]
      var mPath = config.dir_wilds+m
      _[m] = require(mPath)(d.value)
    },
    conn: function (d) {

    }
  },
  del: {
    destroy: function (d) {
      var m = d.key.split(':')[1]
      _[m].emit('close')
      delete _[m]
    },
    disconn: function (d) {

    }
  }
}

module.exports.commands = filter

module.exports = function bricoleur (data) { // YES! only use db
  var conf
  var _ = {}


  // CONFIG : resolve brico filter with paths
  
  // 2 spaces : live modules : connections :: link with filters
  
  data.get('config', function handleConfig (e, d) {
    e ? interface.emit('error', e) : conf = JSON.parse(d);
  })


  // DATA
  
  var liveStream = data.liveStream({old:false}) 
  liveStream.pipe(fern(filter))


  // UTIL
  
  function search (args, cb) {
    var match = false
    var ks = data.createKeyStream()
    ks.on('data', function (d) {
      var path = d.split(':')
      if (args[1] === path[1]) {
        match = true
        for (var i=2; i<args.length;i++) {
          var pair = args[i].split('=')
          var key = pair[0]
          var val = pair[1]
          opts[key] = val
        }
        if (opts === {}) opts = null
        // don't use spaces!
        // data.put(config.spaces.active+':'+args[1],JSON.stringify(opts))
      }
    })
    ks.on('end', function () {
      if (match !== true) interface.emit('error', new Error('could not find module'))
    })
  }


  // EVENT STREAM

  var s = through(function write (d) {
    this.emit('data', d)
  }, function end () {
    this.emit('end')
  })

  liveStream.pipe(filter).pipe(s)

  return s
}
