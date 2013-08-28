// ENVIRONMENT
var filed = require('filed')
, Bricoleur = require('./_brico')
, Compiler = require('./_cmp')
, Map = require('./_map')
, Data = require('./_data')
, Duplex = require('stream').Duplex
, inherits = require('inherits')
, ws = require('ws').Server
, http = require('http')
, asyncMap = require('slide').asyncMap
, websocketStream = require('websocket-stream')

inherits(Env, Duplex)
module.exports = Env

function Env (opts) { 
  var browserMods = []
  , self = this
  Duplex.call(this)

  this._read = function (size) {}

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

  var brico = new Bricoleur()

  var Server = http.createServer(handleReqs)
  Server.listen(opts.port)

  var soc = new ws({server:Server})
  soc.on('connection', function handleSoc (s) {
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
  })

  var _cmp = new Compiler({
    compress:false,
    stylesPath:'./_wilds/_css.styl',
    jsPath:'./__clnt.js',
    cssPath: './_wilds/_styles.css',
    bundlePath:'./_wilds/_bundle.js'
  })

  self.pipe(_cmp)

  this.write = function (chunk) {
    var mod = JSON.parse(chunk.toString())
    mod.process.forEach(function (pro) {
      if (pro==='browser') {
        self.push(chunk)
        browserMods.push(mod)
      }
    })
  }

  this.end = function () {
    console.log('compile!')
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
