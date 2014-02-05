// BRICO


var through = require('through')
var fern = require('fern')
var proc = process.title // node or browser

module.exports = function bricoleur (data) {
  var conf
  var _ = {}

  // CONFIG
  if (!conf) {
    data.get('config', function handleConfig (e, d) {
      e ? interface.emit('error', e) : conf = JSON.parse(d);
    })
  }


  // DATA
  var liveStream = data.liveStream({old:false}) 

  var filter = fern({
    put: {
       live: function (d) {
         var m = d.key.split(':')[1]
         var mPath = config.dir_wilds+m
         _[m] = require(mPath)(d.value)
       },
       conn: function (d) {

       },
       config: function (d) {
         conf = JSON.parse(d.value)
       }
    },
    rm: {
      live: function (d) { // unpipe? close stream!?
        var m = d.key.split(':')[1]
        _[m].emit('close')
        delete _[m]
      },
      conn: function (con) {

      }
    }
  })

  liveStream.pipe(filter).pipe(through(function write (d) {
    console.log(d)
  }, function end () {
    this.emit('end')
  }))

  var interface = through(function input (d) { // REPL INPUT  
    var args = d.split(' ')
    var cmd = args[0]
    api[cmd] ? api[cmd](args) : this.emit('error', new Error('no such command'))
  }, function end () {
    this.emit('end')
  })


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
        data.put(config.spaces.active+':'+args[1],JSON.stringify(opts))
      }
    })
    ks.on('end', function () {
      if (match !== true) interface.emit('error', new Error('could not find module'))
    })
  }

  return interface
}

