// ENVIRONMENT
var Bricoleur = require('./_brico')
, inherits = require('inherits')

module.exports.nodeEnv = nodeEnv
module.exports.browserEnv = browserEnv

function browserEnv (opts, loaded) { // BROWSER ENVIRONMENT
  // no mapping functionailty is available
  loaded()
}

function nodeEnv (opts, loaded) { // NODE ENVIRONMENT
  var filed = require('filed')
  var Map = require('./_map')
  var Compiler = require('./_cmp')
  var Data = require('./_data')
  var ws = require('ws').Server
  var http = require('http')
  var asyncMap = require('slide').asyncMap
  var websocketStream = require('websocket-stream')

  var self = this

  if (!opts) var opts = [ 
    {url:"/",
    file:"./_wilds/_index.html"},
    {url:"/_bundle.min.js",
    file:"./_wilds/_bundle.js"},
    {url:"/_styles.css",
    file:"./_wilds/_styles.css"}
  ]

  var _map = new Map({end:false,dir:'./_wilds'}, function (s) {
    s.pipe(self)
  })

  var _cmp = new Compiler({
    compress:false,
    stylesPath:'./_wilds/_css.styl',
    jsPath:'./__clnt.js',
    cssPath: './_wilds/_styles.css',
    bundlePath:'./_wilds/_bundle.js'
  })

  _cmp.on('data', function (d) {

  })

  var brico = new Bricoleur()

  var Server = http.createServer(handleReqs)
  Server.listen(opts.port)
  
  var soc = new ws({server:Server})
  soc.on('connection', newSocket)

  function newSocket (soc) {
    var wss = websocketStream(s)
    , headers = soc.upgradeReq.headers
    , key = headers['sec-websocket-key']

    brico.socAdd(key, function keyAdded () {
      s.pipe(brico[key]).pipe(s)
    })
    s.write(JSON.stringify({sk:key}))
    _cmp.MODS.forEach(function (mod) {
      s.write(JSON.stringify(mod))
    })
    setTimeout(function () {
      var cmd = {
        r:'con',
        v:['console+brico','brico+mdisp']
      }
      s.write(JSON.stringify(cmd))
    }, 200)
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
