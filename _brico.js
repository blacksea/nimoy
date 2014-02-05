// BRICO


var through = require('through')
var fern = require('fern')
var proc = process.title // node or browser

module.exports = function bricoleur (data) {
  var conf
  var _ = {}

  // CONFIG
  data.get('config', function handleConfig (e, d) {
    e ? interface.emit('error', e) : conf = JSON.parse(d) 
  })


  // DATA 
  // use keypath!
  // load / create a linkmap & use with keypath
  // use proc to decide how to handle data
  // don't use a switch statement / solve it with fern & a map
  var liveStream = data.liveStream({old:false}) 

  var filter = fern({
    put: {
       live: function (mod) {
         var m = mod.key.split(':')[1]
         var mPath = config.dir_wilds+m
         _[m] = require(mPath)(m.value)
       },
       conn: function (con) {

       }
    },
    rm: {
      live: function (mod) { // unpipe? close stream!?
        var m = mod.key.split(':')[1]
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
  })

  // WILDS / RUNNING MODULES
  // condense these into a single tree  
  // make a linkage / transform thing using fern
 

  // METHODS / API
  // handle incoming data / put outgoing data
  // incoming can be repl commands or data.liveStream objects
  var interface = through(function (input) { // interface handles both api / data ls
    // all this input stream should do is write to db

    var args = input.split(' ')
    var cmd = args[0]
    api[cmd] ? api[cmd](args) : this.emit('error', new Error('no such command'))
  }, function end () {
    this.emit('end')
  })

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
