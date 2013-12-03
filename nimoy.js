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
  init: function () {
  },
  map: function (res) {
    var self = this
    var map = require('./_map')
    map(config.wilds, function (m) {
      self.M = m
      res()
    })
  },
  start: function (res) {
    var netHTTP = require('./_net').HTTP
    netHTTP({port:8000,
            host:'localhost',
            dir_static:'./public'
    }, res)
  },
  watchify: function (res) {
    var w = require('watchify')
    w.add(opts.bundle)
    w.on('update', function (ids) {
      w.bundle()
      res()
    })
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

REPL(clc.black.bgCyanBright(' nimoy:0.0.1'))
