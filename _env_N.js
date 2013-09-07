// NODE ENVIRONMENT
var asyncMap = require('slide').asyncMap
var readdir = require('fs').readdir
var ws = require('ws').Server
var websocketStream = require('websocket-stream')
var http = require('http')
var filed = require('filed')
var Map = require('./_map')
var Data = require('./_data')
var Compiler = require('./_cmp')
var Bricoleur = require('./_brico')

module.exports = Environment

function Environment (opts) { 
  var self = this
  , FILES = []
  , MODS = []

  // HTTP SERVER :: HANDLE STATIC FILES
  readdir(opts.wilds, function findStaticFiles (e,files) {
    if (e) console.error(e)
    files.forEach(function matchFile (file) {
      if (file[0] === '_') FILES.push(file)
    })
  })
  function handleReqs (req, res) {
    var headers = req.headers
    , origin = headers.referer
    , agent = headers['user-agent']
    , host = headers.host

    getStaticFile(req.url, function pipeFileStream (filepath) {
      if (filepath !== null) filed(filepath).pipe(res)
    })
  }
  function getStaticFile (path, filePath) {
    if (path === '/') path = '/_index.html'
    var file = path.replace('/','')

    asyncMap(FILES, function matchPathToStatic (staticFile,cb) {
      if (file === staticFile) filePath(opts.wilds+'/'+file)
      if (file !== staticFile) filePath(null)
    }, function () {
      console.log('for req '+path+' streamed file '+file)
    })
  }
  var server = http.createServer(handleReqs)
  server.listen(opts.port, function () {
    console.log('running on port '+opts.port)
  })
  
  // CREATE WEBSOCKET
  function handleSoc (soc) { // fix this thing!
    var ws = websocketStream(soc)
    var headers = soc.upgradeReq.headers
    var key = headers['sec-websocket-key']
  }
  var webSocket = new ws({server:server})
  webSocket.on('connection', handleSoc)
  
  // LOAD ENVIRONMENT
  this.load = function (loaded) {
    // build bricos for each user
    
    var _cmp = new Compiler({// compile for client side
      compress:false,
      stylesPath:'./_wilds/_css.styl',
      jsPath:'./_env_B.js',
      cssPath: './_wilds/_styles.css',
      bundlePath:'./_wilds/_bundle.js'
    })
    var _map = new Map({end:false,dir:'./_wilds'}, function (s) {// map wilds
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
}
