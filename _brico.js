// BRICO

var through = require('through')
var proc = process.title // node or browser

module.exports = function bricoleur (data) {


  // DATA 
  var dataFilter = through(function write(d) {

    var path = d.key.split(':') // filter with path
    var action = path[0]
    var loc = path[1]
    var id = path[2]
    
    if (d.type) switch (d.type) {
      case 'put' : put[action](d); break;
      case 'del' : rm[action](d); break;
      default : console.log(d.type);
    }

    // CRAZINESS!? BUILD DYNAMIC API FROM CONFIG?
    // LINKING / TRANSFORMING

  }, function end () {
    this.emit('end')
  })

  var put = {
  }
  var rm = {
  }

  function put (d) {
    // a way to insert options?
    _[mod.name] = require(mod.name)(mod.opts)
  }

  var liveStream = data.liveStream() 
  liveStream.pipe(dataFilter)


  // WILDS / RUNNING MODULES
  var _ = {}

  function conn (mods) {
    var mods = con.split('-')
    _[mods[0]].pipe(_[mods[1]])
  }


  // METHODS / API
  return through(function interface (input) {
    var args = input.spit(' ')
    var cmd = args[0]

    if (cmd === 'put') { // do module lookup

    }

    // build options
    var opts = {}
    for (var i=2; i<args.length;i++) {
      var pair = args[i].split('=')
      var key = pair[0]
      var val = pair[1]
      opts[key] = val
    }
    console.log(opts)
  }, function end () {
    this.emit('end')
  })
}
