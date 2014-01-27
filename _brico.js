// BRICO

// * brico replicates to client nodes --- client node can have different access priveleges
// modules need an interface/spec --- pass in opts and return stream for now
// some modules may need time to load / init
// expose module data streams
// map / survey / library -- transforms?
// search
// put / rm
// conn / disconn
// env / status
// events
// object/transport/stream protocol

var env = process.title // node or browser

module.exports = function bricoleur (data) {
  var self = this

  var liveStream = data.liveStream() 

  liveStream.on('data', handleData)

  function handleData (d) {

    // old
    if (!d.type) { 
      // {key: val:}
    }

    // fresh
    if (d.type === 'put') {
      // {type: key: val: }
    } 

  }
}
