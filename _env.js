// ENVIRONMENT
var Bricoleur = require('./_brico')
, inherits = require('inherits')

module.exports.browserEnv =  function (opts, loaded) { // BROWSER ENVIRONMENT
  loaded()
}

module.exports.nodeEnv =  function (opts, loaded) { // NODE ENVIRONMENT
  var websocketStream = require('websocket-stream')
  var asyncMap = require('slide').asyncMap
  var Compiler = require('./_cmp')
  var filed = require('filed')
  var Map = require('./_map')
  var Data = require('./_data')
  var ws = require('ws').Server
  var http = require('http')

  var self = this
  , MODS = []

  var brico = new Bricoleur()

  this.load = function (loaded) {
    var _cmp = new Compiler({
      compress:false,
      stylesPath:'./_wilds/_css.styl',
      jsPath:'./__b.js',
      cssPath: './_wilds/_styles.css',
      bundlePath:'./_wilds/_bundle.js'
    })

    var _map = new Map({end:false,dir:'./_wilds'}, function (s) {
      s.on('data', function (buf) {
        var mod = JSON.parse(buf)
        mod.process.forEach(function (p) {
          if (p === 'browser') _cmp.write(buf)
          if (p === 'node') MODS.push(mod)
        })
      })
      s.on('end', function () {
        console.log('mapping done')
      })
    })   
  }

  function newSocket (s) {
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

  var Routes = [ 
    {url:"/",
    file:"./_wilds/_index.html"},
    {url:"/_bundle.min.js",
    file:"./_wilds/_bundle.js"},
    {url:"/_styles.css",
    file:"./_wilds/_styles.css"}
  ]

  function handleReqs (req, res) {
    var match = false
    , headers = req.headers
    , origin = headers.referer
    , agent = headers['user-agent']
    , host = headers.host

    asyncMap(Routes, function matchFile (route, cb) {
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

  var Server = http.createServer(handleReqs)
  Server.listen(opts.port)

  var webSoc = new ws({server:Server})
  // soc.on('connection', newSocket)
  webSoc.on('connection', function (soc) {
    var wss = websocketStream(soc)
    var gps = require('./_wilds/gps.js')
    var g = new gps()
    g.pipe(wss)
//    wss.write(JSON.stringify({bam:'zpppo'}))
    console.log('new connection!')
  })
}
