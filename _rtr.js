// HTTP ROUTER
var filed = require('filed')
, ws_stream = require('websocket-stream')
, inherits = require('inherits')
, Writable = require('stream').Writable
, asyncMap = require('slide').asyncMap

inherits(Router, Writable)

module.exports = Router

function Router (opts) { 
// dynamic index generator
  Writable.call(this)
  if (!opts) var opts = [
    {url:"/",
    file:"./_wilds/_index.html"},
    {url:"/_bundle.min.js",
    file:"./_wilds/_bundle.js"},
    {url:"/_styles.css",
    file:"./_wilds/_styles.css"}
  ]

  this._write = function (chunk,enc,next) {
    var map = chunk.toString()
    console.log(chunk)    
    next()
  }

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
}
