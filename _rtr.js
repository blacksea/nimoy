// ROUTER 

var filed = require('filed')
, async = require('async')

module.exports = function (opts) {
  if (!opts) var opts = null

  opts = [
    {url:"/",
    file:"./_wilds/_index.html"},
    {url:"/_bundle.min.js",
    file:"./_wilds/_bundle.js"},
    {url:"/_styles.css",
    file:"./_wilds/_styles.css"}
  ];

  this.handleRoutes = function (req,res) {
    var match = false
    , headers = req.headers
    , origin = headers.referer
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
}
