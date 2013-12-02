// NIMOY 

var Brico = require('./_brico')
var Data = require('./_data')
var Map = require('./_map')
var Net = require('./_net')
var read = require('read')

var config

fs.readFile('./config.json', function handleConfig (e, buf) {
  if (!e) {
    config = JSON.parse(buf)    
    console.log(config)
  } 
  if (e) console.error(e)
})


var NIMOY = {
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

// pipe this into a cli
nimoy = new fern({tree:NIMOY})
