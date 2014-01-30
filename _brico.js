// BRICO

var through = require('through')
var proc = process.title // node or browser

module.exports = function bricoleur (data) {
  var self = this
  var map


  // DATA 
  data.get('map', function (e, val) {
    if (e) console.error(e)
    if (!e) map = JSON.parse(val)
  })

  var liveStream = data.liveStream({old:false}) 
  liveStream.on('data', filterData)

  function filterData (d) { // should be somekind of filter/register/lookup
    if (d.type && d.type === 'put') {
      var val = d.value
      if (typeof d.value === 'string' && d.value[0] === '{') val = JSON.parse(d.value)
      // if (filter[d.key]) filter[d.key](val)
    }
  }


  // WILDS / RUNNING MODULES
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


  // METHODS / API
  return through(function interface (input) {

    // lookup existing from map & infill
    
    // provide feedback

    if (typeof cmd === 'string') { // use ternary?

      // check for json
      
      if (cmd[0] === '{') var val = JSON.parse(cmd)
      var arg = cmd.split(' ')
      api[arg[0]](arg[1])
     
      // if not json must be simple text command
      
      // maybe an array
      
      //if (cmd instanceof Array)  
    }

  }, function end () {
    this.end()
  })
}
