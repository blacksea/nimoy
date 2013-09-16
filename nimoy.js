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

var Environment = new Env(EnvOpts, function serverRunning () {
  console.log('nimoy running on port '+EnvOpts.port)
  Environment.api.write(['createBrico', DefaultUser, Ready]) 
})

function Ready () {
  Environment.api.write(['load',function () {
    console.log('Environment Loaded!')
  }])
}
