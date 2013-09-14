// NODE ENVIRONMENT
var websocketStream = require('websocket-stream')
var ws = require('ws').Server

var http = require('http')
var filed = require('filed')

var Bricoleur = require('./_brico')

var Map = require('./_map')
var Compiler = require('./_cmp')
var level = require('level')

var asyncMap = require('slide').asyncMap
var readdir = require('fs').readdir


module.exports = Environment

function Environment (opts, running) { 
  var Self = this
  var StaticFiles = {}
  var Data

  var _ = {} // brico scope container
  
  // HTTP SERVER FOR STATIC FILES
  if((opts.path_static.length-1) !== '/') opts.path_static += '/'
  readdir(opts.path_static, function GetStaticFiles (e, files) {
    if (e) console.error(e)
    files.forEach(function findStaticFiles (file) {
      StaticFiles[file] = opts.path_static+file
    })
  })

  var Server = http.createServer(HandleRequests)

  function HandleRequests (req, res) {
    var url = req.url
    if (url === '/') url = '/_index.html'
    var file = url.replace('/','') 

    if (StaticFiles[file]) filed(StaticFiles[file]).pipe(res)
    if (!StaticFiles[file]) res.end() // todo: somekindof 404
  }

  Server.listen(opts.port, function () {
    // change process permissions so node runs as user not root
    // create level instance as user not root
    var uid = parseInt(process.env.SUDO_UID)
    if (uid) process.setuid(uid)
    Data = level(opts.db) 
    // cb that we're up!
    running() 
  })

  // HANDLE WEBSOCKET CONNECTIONS
  var WebSocket = new ws({server:Server})

  WebSocket.on('connection', HandleSoc)

  function HandleSoc (soc) { // fix this thing!
    var ws = websocketStream(soc)
    var headers = soc.upgradeReq.headers
    var key = headers['sec-websocket-key']
    if (headers['sec-websocket-key1']) key = headers['sec-websocket-key1'].replace(/\s/g,'-')
    var host = headers.host

    _[host].addSocket(key)

    ws.pipe(_[host][key]).pipe(ws)
  }
  
  this.loadEnvironment = function (loaded) { 
    var bricoStream = Data.createValueStream()
    bricoStream.on('Data', function (d) {
      var brico = JSON.parse(d)
      _[brico.host] = new Bricoleur()
    })
    bricoStream.on('end', function () {
      loaded()
    })

    var compileOpts = {
      path_wilds:opts.path_wilds,
      path_styl:opts.path_styl,
      path_css:opts.path_css,
      path_bundle:opts.path_bundle,
      path_env:opts.path_js,
      compress:false
    }
    var _cmp = new Compiler(compileOpts) 

    var _map = new Map({
      end:false,
      path_wilds:opts.path_wilds
    }, function (s) {// map wilds
      s.pipe(_cmp.s)
      for (brico in _) {
        _cmp.s.pipe(_[brico].metaStream)
      }
      s.on('end', function () {
        console.log('mapping done')
      })
    })   
  }

  this.createBrico = function (user, cb) {
    user = JSON.stringify(user)
    Data.put(user.host, user, function (e) {
      if (e) console.error(e)
      cb()
    })
  }
}
