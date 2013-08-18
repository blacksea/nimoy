// SERVER START SCRIPT
var Bricoleur = require('./_brico')
, Compiler = require('./_cmp')
, map = require('./_map')
, rtr = require('./_rtr')
, usr = require('./_usr')
, http = require('http')
, fs = require('fs')
, ws = require('ws').Server

var port = 80 // set port

var brico = new Bricoleur()
var _cmp = new Compiler({end:false})

// brico.pipe(process.stdout)

var _map = new map({dir:'./_wilds',end:false}, function mapStream (s) {
  s.server.pipe(brico)
  s.client.pipe(_cmp)
})

// _map.on('change', function (stat) {
//   console.log(stat)
// })

var _rtr = new rtr() // do routing 
var server = http.createServer(_rtr.handleReqs) // handle http requests
server.listen(port)

var wss = new ws({server:server})
wss.on('connection', _rtr.handleSoc)
