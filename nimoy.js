// NIMOY 
var Env = require('./_env_N')

var defaultUser = {
  host:'blacksea',
  connections:'',
  modules:''
}

var envOpts = {
  path_wilds:'./_wilds',
  path_static:'./static',
  path_styl:'./_wilds/_css.styl',
  path_css:'./_wilds/_styles.css', 
  path_bundle:'./_wilds/_bundle.js', 
  path_js:'./_env_B.js',
  port:80,
  db:'./data' 
}

var _env = new Env(envOpts, function serverRunning () {
  _env.addBrico(defaultUser, function () {
    console.log('added user '+defaultUser.host)
    _env.load(function environmentLoaded () {
      console.log('nimoy active! '+envOpts.port)
    })
  })
})
