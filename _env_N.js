// NODE ENVIRONMENT
var websocketStream = require('websocket-stream')
var ws = require('ws').Server

var readdir = require('fs').readdir
var http = require('http')
var filed = require('filed')

var Map = require('./_map')
var Compiler = require('./_cmp')
var level = require('level')

var Bricoleur = require('./_brico')


module.exports = Environment

function Environment (opts, running) { 
  if (opts.path_data[(opts.path_data.length-1)] !== '/') opts.path_data += '/'
  if (opts.path_static[(opts.path_static.length-1)] !== '/') opts.path_static += '/'
  if (opts.path_wilds[(opts.path_wilds.length-1)] !== '/') opts.path_wilds += '/'
  console.log(opts)

  var Self = this
  var StaticFiles = {}
  var Data

  var _ = {} // brico scope container

  // CONFIGURATION 
  
  var CompileOpts = {
    path_wilds:opts.path_wilds,
    path_styl:opts.path_styl,
    path_css:opts.path_css,
    path_bundle:opts.path_bundle,
    path_env:opts.path_js,
    compress:true
  }
  var MapOpts = {
    path_wilds:opts.path_wilds
  }
  
  // HTTP SERVER FOR STATIC FILES
  
  readdir(opts.path_static, function GetStaticFiles (e, files) {
    if (e) console.error(e)
    files.forEach(function findStaticFiles (file) {
      StaticFiles[file] = opts.path_static+file
    })
  })

  var Server = http.createServer(HandleRequests)

  function HandleRequests (req, res) {
    var url = req.url
    if (url === '/') url = '/index.html'
    var file = url.replace('/','') 
    if (StaticFiles[file]) filed(StaticFiles[file]).pipe(res)
    if (!StaticFiles[file]) res.end() // todo: somekindof 404
  }

  Server.listen(opts.port, function () {
    // change process permissions so node runs as user not root
    // create level instance as user not root
    var uid = parseInt(process.env.SUDO_UID)
    if (uid) process.setuid(uid)
    Data = level(opts.path_data+'env') 
    running() 
  })

  // WEBSOCKET CONNECTIONS
  
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

  // API LAYERS
  
  this.loadEnvironment = function (loaded) { 
    var bricoStream = Data.createValueStream()
    bricoStream.on('data', function (d) {
      var brico = JSON.parse(d)
      _[brico.host] = new Bricoleur()
      _[brico.host]['data'] = level(opts.path_data+brico.host)
    })
    bricoStream.on('end', function () {
      console.log(_)
      loaded()
    })

    var _cmp = new Compiler(CompileOpts) 

    var _map = new Map(MapOpts, function (s) {// map wilds
      // add map to bricos stored in env db
      s.end = false
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
    // crete and attach a data instance per brico
    Data.put(user.host, JSON.stringify(user), function (e) {
      if (e) console.error(e)
      cb()
    })
  }
}
