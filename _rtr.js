var filed = require('filed')
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

  this.handleData = function (stream) { 
    var domain = stream.address.address
    stream.on('data', function (json) {
      var data = JSON.parse(json) 

      if (data.tmp_id) { // first conn: make an id and send it
        var id = {} 
        id[data.tmp_id] = stream.id
        stream.write(JSON.stringify(id))
        console.dir(Object[data.host])
        // stream.pipe(Object[data.host].in)
        console.dir('host is '+data.host) // create binding here!
      }

      if (data.id) { // pass to correct brico based on id
      }
    })
  }
}
