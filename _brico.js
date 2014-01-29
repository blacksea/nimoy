// BRICO

// *brico replicates to client nodes --- client node can have different access priveleges
// modules need an interface/spec --- pass in opts and return stream for now
// some modules may need time to load / init
// map / survey / library -- transforms?
// object/transport/stream protocol
// conn / disconn
// env / status
// put / rm
// search

// > pipe modules in to data and filter data in streams based on key or id

// > module representation!?

// > env {mod -- id: // set id using unix timestamp

// create a data model

// everything lives in the db
// env { 
//   modules:
//   connections:
// }

var through = require('through')

var proc = process.title // node or browser

module.exports = function bricoleur (data) {
  var self = this

  var api = { // expose as input to modules
    put : function (d) {
      var timeStamp = new Date().getTime()
      db.put(d.key, d.val)
    },
    get : function (d, cb) {
      console.log(d)
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
  }, function end () {
    this.end()
  }))

  var io = through(function write (d) {
    if (typeof d.value === 'string' && d.value[0] === '{') val = JSON.parse(d.value)
  }, function end () {
    this.end()
  })
  
  return io
}
