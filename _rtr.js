var filed = require('filed')
, async = require('async')

module.exports = function (opts) { // ROUTER / include additional info - like user agent
  if (!opts) var opts = null
  opts = [
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
      if (route.url === path) {
        filed(route.file).pipe(res)
        match = true
      }
      cb()
    }, function () {
      if (match === false) { // url is not default frame do something with it....
        filed('./_wilds/_index.html').pipe(res)
        console.log(req.url) // the url path
      }
    })
  }

  this.handleData = function (stream) { 
    var domain = stream.address.address
    stream.on('data', function (json) {
      var data = JSON.parse(json) 
      console.dir(data)

      if (data.tmp_id) { // first conn, make an id and send it
        var id = {} 
        id[data.tmp_id] = stream.id
        stream.write(JSON.stringify(id))
        console.dir('host is '+data.host) // create binding!
      }

      if (data.id) { // pass to correct brico based on id
      }
    })
  }
}
