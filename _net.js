// NET

function HTTP (opts, ready) {
  var fs = require('fs')
  var http = require('http')
  var StaticFiles = {}

  var index = '<html><head><title></title></head><body>'
  +'<script src="'+opts.bundle+'"></script>'
  +'</body></html>'

  if (opts.dir_static[opts.dir_static.length-1] !== '/') opts.dir_static += '/'

  fs.readdir(opts.dir_static, function GetStaticFiles (e, files) {
    if (e) console.error(e)
    if (!e) { files.forEach(function findStaticFiles (file) {
        StaticFiles[file] = opts.path_static+file
      })
    }
  })

  function HandleRequests (req, res) {
    var url = req.url
    res.setHeader('Content-Type','text/html')
    if (url === '/') res.end(index)
    var file = url.replace('/','') 
    if (StaticFiles[file]) fs.createReadStream(StaticFiles[file]).pipe(res)
    if (!StaticFiles[file]) res.end('nobody')
  }

  var server = http.createServer(HandleRequests)
  server.listen(opts.port,opts.host,ready)

  WS(server, function handleSoc (soc) {
  })
}

function WS (server, soc) {
  var ws = require('ws')
  var websocketStream = require('websocket-stream')
  var WebSocket = new ws({server:server})

  WebSocket.on('connection', HandleSoc)

  function HandleSoc (soc) { // fix this thing!
    var wss = websocketStream(soc)
    var headers = soc.upgradeReq.headers
    var key = headers['sec-websocket-key']
    var host = headers.host
    if (headers['sec-websocket-key1']) key = headers['sec-websocket-key1'].replace(/\s/g,'-')
  }
}

function browserStuff () {
  if(!Function.prototype.bind) require('bindshim') 
  var host = window.document.location.host.replace(/:.*/, '');
}

module.exports.HTTP = HTTP

module.exports.WS = WS
