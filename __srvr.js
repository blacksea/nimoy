// SERVER START SCRIPT
var Bricoleur = require('./_brico')
, Compiler = require('./_cmp')
, map = require('./_map')
, rtr = require('./_rtr')
, usr = require('./_usr')
, http = require('http')
, fs = require('fs')
, ws = require('ws').Server
, wsstream = require('websocket-stream')

var port = 80 // set port

var brico = new Bricoleur()
var _cmp = new Compiler({end:false,compress:false})

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
  console.log(soc)
  _cmp.getMods(function (mods) {
    s.write(JSON.stringify(mods[0]))
  })
})
