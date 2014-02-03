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
  var dataFilter = through(function write(d) {
    var path = d.key.split(':')
    var action = path[0]
    var loc = path[1]
    var id = path[2]

    switch (action) {
      default : interface.emit('error', new Error('unable to handle action: '+action))
    }

  }, function end () {
    this.emit('end')
  })

  var fil = {
    put: function (mod) {
      // a way to insert options?
      _[mod.name] = require(mod.name)(mod.opts)
      console.log(_)
    },
    rm: function (mod) {
      // unpipe? close stream!?
      _[mod.name].emit('close')
      delete _[mod.name]
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

  var liveStream = data.liveStream({old:false}) 
  liveStream.pipe(dataFilter)


  // WILDS / RUNNING MODULES
  var api = { // use prefixes from config
    put: function (args) {
      var match = false
      var opts = {}

      // check module exists
      var ks = data.createKeyStream()
      ks.on('data', function (d) {
        var path = d.split(':')
        if (args[1]===path[1]) {
          match = true
          for (var i=2; i<args.length;i++) {
            var pair = args[i].split('=')
            var key = pair[0]
            var val = pair[1]
            opts[key] = val
          }
          if (opts === {}) opts = null
          data.put(config.spaces.active+args[1],JSON.stringify(opts))
        }
        // what prefix?
      })
      ks.on('end', function () {
        if (match!==true) interface.emit('error', new Error('could not find module'))
      })
    }
  }

  // METHODS / API
  var interface = through(function (input) {
    var args = input.split(' ')
    var cmd = args[0]
    api[cmd] ? api[cmd](args) : this.emit('error', new Error('no such command'))
  }, function end () {
    this.emit('end')
  })

  return interface
}
