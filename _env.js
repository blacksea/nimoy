// ENVIRONMENT
var filed = require('filed')
, Compiler = require('./_cmp')
, inherits = require('inherits')
, Duplex = require('stream').Duplex
, asyncMap = require('slide').asyncMap

inherits(Env, Duplex)
module.exports = Env

function Env (opts) { 
  Duplex.call(this)

  var _cmp = new Compiler({
    compress:false,
    stylesPath:'./_wilds/_css.styl',
    jsPath:'./__clnt.js',
    cssPath: './_wilds/_styles.css',
    bundlePath:'./_wilds/_bundle.js'
  })

  if (!opts) var opts = [ 
    {url:"/",
    file:"./_wilds/_index.html"},
    {url:"/_bundle.min.js",
    file:"./_wilds/_bundle.js"},
    {url:"/_styles.css",
    file:"./_wilds/_styles.css"}
  ]

  this.write = function (chunk) {
    console.log(chunk)
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
