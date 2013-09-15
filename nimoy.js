// NIMOY 

var Env = require('./_env_N')

var DefaultUser = {
  host:'blacksea',
  connections:'',
  modules:''
}

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

var _env = new Env(EnvOpts, function serverRunning () {
  _env.createBrico(DefaultUser, function () {
    console.log('added user '+DefaultUser.host)
    _env.loadEnvironment(function environmentLoaded () {
      console.log('nimoy running on port '+EnvOpts.port)
    })
  })
})
