// BRICO

var through = require('through')
var proc = process.title // node or browser

module.exports = function bricoleur (data) {
  var self = this
  var map

  // WILDS  
  var _ = {}

  function rm (mod) {
    _[mod].end()
    delete _[mod]
  }

  function put (mod) {
    if (map[mod] && map[mod].nimoy.process === proc) 
      _[mod] = require('./_wilds/'+mod)()
  }

  function conn (mods) {
    var mods = con.split('-')
    _[mods[0]].pipe(_[mods[1]])
  }

  // DATA MANIP
  data.get('map', function (e, val) {
    if (e) console.error(e)
    if (!e) map = JSON.parse(val)
  })

  var api = {

  }

  // DATA HANDLING
  var liveStream = data.liveStream({old:false}) 
  liveStream.on('data', filterData)

  function filterData (d) {
    if filter[d]

  }
  var filter = { 
    map : function (m) {

    },
    env : function (env) {

    }
  }

  // INTERFACE / API
  var interface = through(function write (cmd) {
    var arg = cmd.split(' ')
    api[arg[0]](arg[1])
    // if (typeof d.value === 'string' && d.value[0] === '{') val = JSON.parse(d.value)
  }, function end () {
    this.end()
  })
  
  return interface
}
