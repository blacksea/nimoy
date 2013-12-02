// BROWSER NET 

var through = require('through')
var websocketStream = require('websocket-stream')
var ws = require('ws').Server

// maybe use engine.io cause it has fallback for older browsers?

var fs = require('fs')
var http = require('http')
var fern = require('fern')

// CONFIGURATION 


// might need muxdemux too

// put client side ws connection in here somehow
// tell browserify to ignore the rest

module.exports.http = netHTTP

module.exports.ws = netWS

// SERVER NET

function netWS (server,soc) {
  var WebSocket = new ws({server:Server})

  WebSocket.on('connection', HandleSoc)

  function HandleSoc (soc) { // fix this thing!
    var wss = websocketStream(soc)
    var headers = soc.upgradeReq.headers
    var key = headers['sec-websocket-key']
    var host = headers.host
    if (headers['sec-websocket-key1']) key = headers['sec-websocket-key1'].replace(/\s/g,'-')
    // pass out duplex stream object
  }
}

function browserStuff () {
  if(!Function.prototype.bind) require('bindshim') 
    var host = window.document.location.host.replace(/:.*/, '');
}

function netHTTP (opts,running) {

  if (opts.path_data[(opts.path_data.length-1)] !== '/') opts.path_data += '/'
  if (opts.path_static[(opts.path_static.length-1)] !== '/') opts.path_static += '/'
  if (opts.path_wilds[(opts.path_wilds.length-1)] !== '/') opts.path_wilds += '/'

  var self = this
  var StaticFiles = {}

  
  fs.readdir(opts.path_static, function GetStaticFiles (e, files) {
    if (e) console.error(e)
    files.forEach(function findStaticFiles (file) {
      StaticFiles[file] = opts.path_static+file
    })
  })

  var Server = http.createServer(HandleRequests)

  // Server.listen(opts.port, function () { 
  //   var uid = parseInt(process.env.SUDO_UID) 
  //   if (uid) process.setuid(uid) // switch to user permissions
  //   // load level now so it doesn't run as sudo
  // })

  function HandleRequests (req, res) {
    var url = req.url
    if (url === '/') url = '/index.html'
    var file = url.replace('/','') 
    if (StaticFiles[file]) fs.createReadStream(StaticFiles[file]).pipe(res)
    if (!StaticFiles[file]) res.end('nobody') // todo: somekindof 404
  }
}
