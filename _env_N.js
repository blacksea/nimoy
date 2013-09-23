// NODE ENVIRONMENT

var websocketStream = require('websocket-stream')
var ws = require('ws').Server

var readdir = require('fs').readdir
var http = require('http')
var filed = require('filed')
var fern = require('fern')

var map = require('./_map')
var cmp = require('./_cmp')
var level = require('level')

var Bricoleur = require('./_brico')

module.exports = Environment

function Environment (opts, running) { 
  if (opts.path_data[(opts.path_data.length-1)] !== '/') opts.path_data += '/'
  if (opts.path_static[(opts.path_static.length-1)] !== '/') opts.path_static += '/'
  if (opts.path_wilds[(opts.path_wilds.length-1)] !== '/') opts.path_wilds += '/'

  var self = this
  var StaticFiles = {}
  var Data

  var _ = {} // brico scope container // replace with com core --

  // CONFIGURATION 
  
  var CompileOpts = {
    path_wilds:opts.path_wilds,
    path_styl:opts.path_styl,
    path_css:opts.path_css,
    path_bundle:opts.path_bundle,
    path_env:opts.path_js,
    compress:false
  }
  var MapOpts = {
    path_wilds:opts.path_wilds
  }
  var Map = new map(MapOpts, function (s) {// map wilds
    var compiler = new cmp(CompileOpts) 
    s.pipe(compiler.s)
    s.on('end', function () {
      console.log('map of '+opts.path_wilds+' complete!')
    })
  })   
 
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
    var uid = parseInt(process.env.SUDO_UID) 
    if (uid) process.setuid(uid) // switch to user permissions
    Data = level(opts.path_data+'env') // wait until user permissions are active
    running() 
  })

  // WEBSOCKET CONNECTIONS
  
  var WebSocket = new ws({server:Server})

  WebSocket.on('connection', HandleSoc)

  function HandleSoc (soc) { // fix this thing!
    var wss = websocketStream(soc)
    var headers = soc.upgradeReq.headers
    var key = headers['sec-websocket-key']
    if (headers['sec-websocket-key1']) key = headers['sec-websocket-key1'].replace(/\s/g,'-')
    var host = headers.host

    _[host].addSocket(key, function socketAdded() {
      console.log('opened socket: '+key+' to brico: '+host)
      wss.pipe(_[host][key])
      wss.write(JSON.stringify({'api':['test','xolander']}))
    })
  }

  // API
   
  var API = {
    load: function (u, cb) {
      var streamBricos = Data.createValueStream()
      streamBricos.on('data', function (d) {
        var brico = JSON.parse(d)
        _[brico.host] = new Bricoleur()
        _[brico.host].data = level(opts.path_data+brico.host)
      })
      streamBricos.on('end', function () {
        cb('done!')
      })
    },
    createBrico: function (brico, next) {
      Data.put(brico.key, JSON.stringify(brico), function () {
        console.log(brico)
        next(brico)
      }) 
    }
  }
  this.api = new fern({tree:API})
}
