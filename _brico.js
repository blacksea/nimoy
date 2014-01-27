// BRICO

// * brico replicates to client nodes --- client node can have different access priveleges
// modules need an interface/spec --- pass in opts and return stream for now
// some modules may need time to load / init
// map / survey / library -- transforms?
// object/transport/stream protocol
// conn / disconn
// env / status
// put / rm
// search

var through = require('through')

var proc = process.title // node or browser

module.exports = function bricoleur (data) {
  var self = this

  var liveStream = data.liveStream({tail:true, old:false}) 

  liveStream.pipe(through(function handleData (d) {
    var val = d.value
    var key = d.key

    if (typeof d.value === 'string' && d.value[0] === '{') val = JSON.parse(d.value)

    if (d.type === 'put' && filter[key]) filter[key](val)

  }, function end () {
    this.end()
  }))

  var timeStamp = new Date().getTime()
  console.log(timeStamp)

  var filter = {
    map : function (m) { // index?!
      console.log(m)
    },
    env : function (env) {
      console.log(env)
    }
  }

  this.api = {
    put : function (cmd) {

    }, 
    rm : function (mod) {

    },
    list : function () {

    }
  }

  // > pipe modules in to data and filter data in streams based on key or id

  // module representation!?
  
  // env {mod -- id: // set id using unix timestamp
}
