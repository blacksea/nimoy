// SERVER START SCRIPT
var Bricoleur = require('./_brico')
, Compiler = require('./_cmp')
, data = require('./_data')
, map = require('./_map')
, rtr = require('./_rtr')
, http = require('http')
, fs = require('fs')
, ws = require('ws').Server
, wsstream = require('websocket-stream')

var port = 80 // set port

var brico = new Bricoleur()
var _cmp = new Compiler({compress:false,stylesPath:'./_wilds/_css.styl',jsPath:'./__clnt.js',bundlePath:'./_wilds/_bundle.js'})
var _map = new map({dir:'./_wilds'}, function mapStream (s) {
  s.server.pipe(brico)
  s.client.pipe(_cmp)
})

var _rtr = new rtr() // do routing 
var server = http.createServer(_rtr.handleReqs) // handle http requests
server.listen(port)

var wss = new ws({server:server})
// wss.on('connection', _rtr.handleSoc)
wss.on('connection', function handleSoc (soc) {
  var s = wsstream(soc)
  _cmp.getMods(function (mods) {
    mods.forEach(function (mod) {
      s.write(JSON.stringify(mod))
    })
  })
})
