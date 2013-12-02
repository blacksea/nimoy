// NIMOY 

var Brico = require('./_brico')
var Data = require('./_data')
var Map = require('./_map')
var Net = require('./_net')
var read = require('read')
var clc = require('cli-color')
var fern = require('fern')
var fs = require('fs')

var config

fs.readFile('./config.json', function handleConfig (e, buf) {
  if (e) console.error(e)
  if (!e) config = JSON.parse(buf)    
})

var nimoy = {
  map: function (res) {
    Map(config.wilds, function (m) {
      res(clc.yellowBright('mapped '+config.wilds))
    })
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

function REPL (msg) {
  if (msg) console.log(msg)
  read({}, function handleInput (e,c,d) {
    if (e) console.error(e)
    if (!e) {
      var args = c.match(' ')
      if (args !== null) { 
        c = c.split(' ')
        nimoy[c[0]](c[1],REPL)
      } else {
        nimoy[c](REPL)
      }
    }
  })
}

REPL(clc.cyanBright('welcome to nimoy! \n please enter command:'))
