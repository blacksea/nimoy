// SERVER START SCRIPT
var Bricoleur = require('./_brico')
, data = require('./_data')
, map = require('./_map')
, rtr = require('./_env')
, http = require('http')
, fs = require('fs')
, ws = require('ws').Server
, wsstream = require('websocket-stream')

var port = 80 // set port

var brico = new Bricoleur()

var _map = new map({dir:'./_wilds'}, function mapStream (s) {
  s.pipe(env)
})

var _rtr = new rtr() // do routing 
var server = http.createServer(_rtr.handleReqs) // handle http requests
server.listen(port)

var wss = new ws({server:server})

wss.on('connection', function handleSoc (soc) {
  var s = wsstream(soc)
  , headers = soc.upgradeReq.headers
  , key = headers['sec-websocket-key']

  brico.socAdd(key, function keyAdded () {
    s.pipe(brico[key]).pipe(s)
  })

  s.write(JSON.stringify({sk:key}))
  s.write(JSON.stringify({k:key,test:'tor'}))

  _cmp.getMods(function (mods) {
    mods.forEach(function (mod) {
      s.write(JSON.stringify(mod))
    })
  })
})
