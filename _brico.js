// BRICO

// * brico replicates to client nodes --- client node can have different access priveleges
// modules need an interface/spec --- pass in opts and return stream for now
// some modules may need time to load / init
// map / survey / library -- transforms?
// search
// put / rm
// conn / disconn
// env / status
// object/transport/stream protocol

var through = require('through')

var proc = process.title // node or browser

module.exports = function bricoleur (data) {
  var self = this

  var liveStream = data.liveStream({old:false}) 

  liveStream.pipe(through(function handleData (d) {
    var val
    var key = d.key
    if (typeof d.value === 'string' && d.value[0] === '{') val = JSON.parse(d.value)

    if (filter[key]) filter[key](val)


  }, function end () {
    this.end()
  }))

  var filter = {
    map : function (m) {
      console.log(m)
    },
    env : function (env) {
      console.log(env)
    }
  }
}
