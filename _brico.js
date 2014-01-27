// BRICO

var env = process.title // node or browser
var through = require('through')

module.exports = function bricoleur (data) {
  var self = this

  // leveldb live events
  var liveStream = data.liveStream() 
  liveStream.on('data', handleData)

  function handleData (d) {
    if (!d.type) { // events in history
      console.log('old \n'+d)
    }
    if (d.type === 'put') {
      switch (d.key) {
        case 'map' : handleMap(d.value); break;
      }
    }
  }

  function handleMap (m) {
    var map = JSON.parse(m)
    console.log(map)
  }

  this.put = function (mod, cb) { // put module
    // put 'module' opt=string opt=string

  }

  this.rm = function (mod, cb) { // rm module
    // rm module

  }

  this.conn = function (mods, cb) { // connect modules
    // conn module module module

  }

  this.disconn = function (mods, cb) { // disconnect modules
    // disconn module /single /chain

  }

  this.status = function (cb) {
    // view env & conns
    
  }
  // map / survey / library -- transforms?
  // search
  // put / rm
  // conn / disconn
  // env / status
  // events
  // object/transport/stream protocol
}
