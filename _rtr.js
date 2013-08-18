// HTTP ROUTER
var filed = require('filed')
, ws_stream = require('websocket-stream')
, asyncMap = require('slide').asyncMap

module.exports = function Router (opts) { 
  if (!opts) var opts = [
    {url:"/",
    file:"./_wilds/_index.html"},
    {url:"/_bundle.min.js",
    file:"./_wilds/_bundle.js"},
    {url:"/_styles.css",
    file:"./_wilds/_styles.css"}
  ]

  this.handleReqs = function (req, res) {
    var match = false
    , headers = req.headers
    , origin = headers.referer
    , agent = headers['user-agent']
    , host = headers.host

    asyncMap(opts, function matchFile (route, cb) {
      if (route.url === req.url) {
        filed(route.file).pipe(res)
        match = true
      }
      cb()
    }, function matchFileDone () {
      if (match === false) { // do something with url!
        var path = req.url
        filed('./_wilds/_index.html').pipe(res)
      }
    })
  }

  this.handleSoc = function (ws) { // new connection
    var wss = ws_stream(ws)
    , headers = ws.upgradeReq.headers
    , key = headers['sec-websocket-key']
    , host = headers.host
    // , brico = Object[host]

    // add connection
    // brico.addConnection(key)
    // wss.pipe(brico[key].in)
    // brico[key].out.pipe(wss)

    // var initObj = {}
    // initObj.client_id = key
    // initObj.usr = brico.usr
    // initObj.map = brico.map.client
    // initObj.map.meta = 'module_map'
    // brico[key].send(initObj)

    // when socket closes remove connection
    ws.on('close', function socClosed () {
      // brico.removeConnection(key)
      console.log('soc '+key+' closed!')
    })
  }
}
