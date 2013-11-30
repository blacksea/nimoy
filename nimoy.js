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

