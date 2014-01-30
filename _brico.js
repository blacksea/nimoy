// BRICO

var through = require('through')
var proc = process.title // node or browser

module.exports = function bricoleur (data) {


  // DATA 
  var dataFilter = through(function write(d) {
    console.log(d)
    // should be somekind of filter/register/lookup
    // just use level encoding info to get encoding
    
    // use keystructure & encoding!

    if (d.type && d.type === 'put') {
      typeof d.value === 'string' && d.value[0] === '{' 
        ? var val = JSON.parse(d.value)
        : var val = d.value
    }
  }, function end () {
    this.emit('end')
  })

  var liveStream = data.liveStream({old:false}) 
  liveStream.pipe(dataFilter)


  // BOOT 
  var ks = data.createKeyStream()
  ks.pipe(dataFilter)

  
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


  // METHODS / API / get data into db
  return through(function interface (input) {

    // lookup existing from map & infill
    // provide feedback
    
     
      // if not json must be simple text command
      // maybe an array
      //if (cmd instanceof Array)  
  }, function end () {
    this.end()
  })
}

// MODE? / AUTH?  
