// BRICO

var through = require('through')
var proc = process.title // node or browser

module.exports = function bricoleur (data) {


  // DATA 
  var dataFilter = through(function write(d) {
    var path = d.key.split(':')
    index(path) // maybe this shouldn't be called all the time

    console.log(d)

    // should be somekind of filter/register/lookup
    // just use level encoding info to get encoding
    // use keystructure & encoding!

  }, function end () {
    this.emit('end')
  })

  function index (path) { // build an index!

  }

  var liveStream = data.liveStream() 
  liveStream.pipe(dataFilter)


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
  // GET DATA IN!
    

  }, function end () {
    this.end()
  })
}
