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

  this.handleReqs = function (req,res) {
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

  this.handleData = function (ws) { 
    var stream = ws_stream(ws)
    , headers = ws.upgradeReq.headers
    , key = headers['sec-websocket-key']
    , host = headers.host
    , new_id = new Date().getTime()

    console.log('new connection: '+key)

    stream.write(JSON.stringify({new_id:new_id})) // send an id 

    stream.on('data', function (json) {
      var data = JSON.parse(json) 
      if (data.newConn) {
        stream.pipe(Object[data.newConn].in) // * connecting every user to the same stream is likely very bad
        Object[data.newConn].out.pipe(stream)
      }
      // closed connections?
    })
    ws.on('close', function () {
      console.log('closing connection: '+key)
    })
  }
}
