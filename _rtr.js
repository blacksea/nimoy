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
      if (route.url === req.url) {
        console.dir('serving '+route.file)
        filed(route.file).pipe(res)
        match = true
      }
      cb()
    }, function () {
      if (match === false) res.end('404')
    })
  }

  // match brico based on domain -- handle seperate instances with id

  this.handleData = function (stream) { 
    var domain = stream.address.address
    stream.on('data', function (json) {
      var data = JSON.parse(json) 

      if (data.tmp_id) { // first conn, send an id
        console.dir(stream.address.address)
        var id = {} 
        id[data.tmp_id] = stream.id
        stream.write(JSON.stringify(id))
      }

      if (data.id) { // pass to correct brico based on id
        console.log('send data to '+data.id)
      }
    })
  }
}
