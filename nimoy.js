// NIMOY 

var Brico = require('./_brico')
var Data = require('./_data')
var Map = require('./_map')
var Net = require('./_net')

var DefaultUser = {
  host:'blacksea',
  connections:'',
  modules:''
}

// use config option to set js output location + use with http

var EnvOpts = {
  path_wilds:'./_wilds',
  path_static:'./_static',
  path_styl:'./_static/default.styl',
  path_css:'./_static/styles.css', 
  path_bundle:'./_static/bundle.js', 
  path_js:'./_env_B.js',
  path_data:'./data',
  port:80,

}

Server.listen(opts.port, function () {
  var uid = parseInt(process.env.SUDO_UID) 
  if (uid) process.setuid(uid) // switch to user permissions
  // load level now so it doesn't run as sudo
})

var API = {
  load: function (u, cb) {
    var streamBricos = Data.createValueStream()
    streamBricos.on('data', function (d) {
      var brico = JSON.parse(d)
      _[brico.host] = new Bricoleur()
      _[brico.host].data = level(opts.path_data+brico.host)
    })
    streamBricos.on('end', function () {
      cb('done!')
    })
  },
  createBrico: function (brico, next) {
    Data.put(brico.key, JSON.stringify(brico), function () {
      next(brico)
    }) 
  }
}
this.api = new fern({tree:API})
