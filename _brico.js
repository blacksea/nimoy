// BRICO


var through = require('through')
var proc = process.title // node or browser

module.exports = function bricoleur (data) {
  var conf
  var _ = {}

  // get config!
  data.get('config', function handleConfig (e, d) {
    e ? interface.emit('error', e) : conf = JSON.parse(d) 
  })


  // DATA 
  var liveStream = data.liveStream({old:false}) 

  liveStream.pipe(through(function filterData(d) { // filter livestream events
    if (d.type == 'del') fil.rm(d)
    // use keypath!
    // load / create a linkmap & use with keypath
    // use proc to decide how to handle data
    if (d.type === 'put') {
      var path = d.key.split(':')
      var action = path[0]
      var loc = path[1]
      var id = path[2]
      if (typeof d.value === 'string' && d.value[0] === '{') d.value = JSON.parse(d.value)

      switch (action) {
        case config.spaces.active : fil.put(d); break;
        default : interface.emit('error', new Error('unable to handle action: '+action))
      }
    }
  }, function end () {
    this.emit('end')
  }))


  // WILDS / RUNNING MODULES
  // condense these into a single tree  
  // make a linkage / transform thing using fern
  var fil = {
    put: function (mod) {
      // a way to insert options?
      var m = mod.key.split(':')[1]
      var mPath = config.dir_wilds+m
      _[m] = require(mPath)(m.value)
      console.log(_)
    },
    rm: function (mod) {
      // unpipe? close stream!?
      _[mod.key].emit('close')
      delete _[mod.key]
      console.log(_)
    },
    conn: function (mods) {
      var mods = con.split('-')
      _[mods[0]].pipe(_[mods[1]])
    },
    disconn: function (mods) {
      var mods = con.split('-')
      _[mods[0]].unpipe(_[mods[1]])
    }
  }

  // METHODS / API
  // handle incoming data / put outgoing data
  // incoming can be repl commands or data.liveStream objects
  var interface = through(function (input) { // interface handles both api / data ls
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
    }) // what prefix?
    ks.on('end', function () {
      if (match !== true) interface.emit('error', new Error('could not find module'))
    })
  }

  return interface
}
