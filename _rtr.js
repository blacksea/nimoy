var filed = require('filed')
, ws_stream = require('websocket-stream')
, async = require('async')

module.exports = function (opts) { // ROUTER 
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

    async.forEach(opts, function (route, cb) {
      if (route.url === req.url) {
        filed(route.file).pipe(res)
        match = true
      }
      cb()
    }, function () {
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
    , brico = Object[host]

    // add connection
    brico.addConnection(key)
    wss.pipe(brico[key].in)
    brico[key].out.pipe(wss)
   
    // when socket closes remove connection
    ws.on('close', function () {
      brico.removeConnection(key)
    })
  }
}
