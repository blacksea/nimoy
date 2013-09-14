// NIMOY 
var Env = require('./_env_N')

var defaultUser = {
  host:'blacksea',
  connections:'',
  modules:''
}

var envOpts = {
  path_wilds:'./_wilds',
  path_static:'./_static',
  path_styl:'./_static/default.styl',
  path_css:'./_static/styles.css', 
  path_bundle:'./_static/bundle.js', 
  path_js:'./_env_B.js',
  port:80,
  db:'./data' 
}

var _env = new Env(envOpts, function serverRunning () {
  _env.createBrico(defaultUser, function () {
    console.log('added user '+defaultUser.host)
    _env.loadEnvironment(function environmentLoaded () {
      console.log('nimoy active! '+envOpts.port)
    })
  })
})
