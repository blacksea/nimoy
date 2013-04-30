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
  ];

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
        filed('./_wilds/_index.html').pipe(res)
        var path = req.url
      }
    })
  }

  this.handleData = function (ws) { 
    var stream = ws_stream(ws)
    console.dir(stream)
    var domain = stream.address.address
    stream.on('data', function (json) {
      var data = JSON.parse(json) 

      if (data.tmp_id) { // first conn: make an id and send it
        var id = {} 
        id[data.tmp_id] = stream.id
        stream.host = data.host // add host property to stream
        stream.write(JSON.stringify(id))
        stream.pipe(Object[stream.host].in)
        Object[stream.host].out.pipe(stream)
      }

      if (data.id) { // pass to correct brico based on id
      }
    })
    stream.on('close', function () { 
      // remove id + unpipe brico
      // stream.unpipe()
      // Object[stream.host].out.unpipe(stream)
      console.dir(stream)
    })
  }
}
