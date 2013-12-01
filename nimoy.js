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

// expose a global db object to bricos - interface is the same on both server and client

// use config option to set js output location & use with http

var EnvOpts = {
  path_wilds:'./_wilds',
  path_static:'./_static',
  path_styl:'./_static/default.styl',
  path_css:'./_static/styles.css', 
  path_bundle:'./_static/bundle.js', 
  path_js:'./_env_B.js',
  path_data:'./data',
  port:80
}

// support a config.json


var API = {
  makeMap: function () {
    // update the map and put a cache in leveldb
  },
  dbInit: function () {
    // enable db / data -- setup storage
  },
  addUser: function () {
  },
  getUser: function () {
  },
  delUser: function () {
  },
  newBrico: function (brico, next) {
    Data.put(brico.key, JSON.stringify(brico), function () {
      next(brico)
    }) 
  }
}
this.api = new fern({tree:API})
