// NIMOY 

var argv = require('optimist').argv
var read = require('read')
var clc = require('cli-color')
var pw = require('credential')
var fs = require('fs')

var config 
var port 
var host
var wsport

fs.readFile('./config.json', function handleConfig (e, buf) {
  if (e) console.error(e)
  if (!e) config = JSON.parse(buf)    
})

if (argv.port) port = argv.port
if (argv.host) host = argv.host
if (argv.wsport) wsport = argv.wsport

var nimoy = {

  map: function (res) {
    var self = this
    var map = require('./_map')
    map(config.wilds, function (m) {
      self.M = m
      res('map complete!')
    })
  },

  start: function (res) {
    var netHTTP = require('./_net').HTTP
    var netConfig = {
      port:8000,
      host:'localhost',
      dir_static:'./public'
    }
    netHTTP(netConfig, function listening () {
      res('server running on '+netConfig.port)
    })
  },

  watchify: function (res) {
    var w = require('watchify')
    w.add() // browser side!
    w.on('update', function (ids) {
      var bundleJS = fs.createWriteStream(opts.path_bundle)
      w.bundle().pipe(bundleJS)
      bundleJS.on('end', res)
    })
  }
}

function REPL (msg) {
  if (msg) console.log(clc.xterm(clr.b)(msg))
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

var colors = [
  {f:0,b:11},
  {f:0,b:14},
  {f:0,b:15}
]

var clr = colors[Math.floor(Math.random() * ((colors.length-1) - 0 + 1) + 0)]

REPL(clc.xterm(clr.f).bgXterm(clr.b)(' nimoy:0.0.1'))
