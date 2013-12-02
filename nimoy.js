// NIMOY 

var read = require('read')
var clc = require('cli-color')
var fs = require('fs')

var config

fs.readFile('./config.json', function handleConfig (e, buf) {
  if (e) console.error(e)
  if (!e) config = JSON.parse(buf)    
})

var nimoy = {
  map: function (res) {
    var self = this
    var map = require('./_map')
    map(config.wilds, function (m) {
      self.M = m
      res(clc.yellowBright('mapped '+config.wilds))
    })
  },
  start: function (res) {
    res(clc.yellowBright(this.M))
  },
  stop: function () {
  }, 
  newBrico: function (brico, next) {
    var brico = require('./_brico')
    var data = require('./_data')
    data.put(brico.key, JSON.stringify(brico), function () {
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
