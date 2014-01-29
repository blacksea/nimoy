// BRICO

// > pipe modules in to data and filter data in streams based on key or id
// > module representation!?
// > env mod -- id: // set id using unix timestamp

// stream for action | stream for data > merge data / actions

var through = require('through')

var proc = process.title // node or browser

module.exports = function bricoleur (data) {
  var self = this
  var _ = {}
  var map

  data.get('map', function (e, val) {
    if (e) console.error(e)
    if (!e) map = JSON.parse(val)
  })

  var api = { // expose as input to modules
    search : function (arg) {
      if (!arg) console.log(map)
      if (map[arg]) console.log(map[arg])
    },
    put : function (mod) {
      var timeStamp = new Date().getTime()
      if (map[mod]) _[mod] = require('./_wilds/'+mod)();console.log(_)
    },
    conn : function (con) {
      var mods = con.split('-')
      console.log('mod A: '+mods[0])
      console.log('mod A: '+mods[1])
      _[mods[0]].pipe(_[mods[1]])
    },
    rm : function (mod) {
      _[mod].end()
      delete _[mod]
      console.log(_)
    }
  }

  var filter = {
    map : function (m) { // index?!
      console.log(m)
    },
    env : function (env) {
      console.log(env)
    }
  }

  var liveStream = data.liveStream({tail:true, old:false}) 

  liveStream.pipe(through(function handleData (d) {
    if (d.type === 'put') io.emit('data', d) 
    // filter here!
  }, function end () {
    this.end()
  }))

  var io = through(function write (cmd) {
    var arg = cmd.split(' ')
    api[arg[0]](arg[1])
    // if (typeof d.value === 'string' && d.value[0] === '{') val = JSON.parse(d.value)
  }, function end () {
    this.end()
  })
  
  return io
}
