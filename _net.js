// NET

function HTTP (opts, ready) {
  var fs = require('fs')
  var http = require('http')
  var zlib = require('zlib')

  if (opts.dir_static[opts.dir_static.length-1] !== '/') opts.dir_static += '/'
  var static = opts.dir_static

  function HandleRequests (req, res) {
    var index = '<html><head><title></title></head><body>'
    +'<script src="'+opts.bundle+'"></script>'
    +'</body></html>'

    if (req.url === '/') {
      res.end(index)
      res.setHeader('Content-Type','text/html')
    } else if (req.url !== '/') {
      var file = fs.createReadStream(static+req.url.replace('/',''))
      res.writeHead(200, {'content-encoding': 'gzip'})
      file.pipe(zlib.createGzip()).pipe(res)
      file.on('error', function(e) {
        console.error(e)
        res.end('404')
      })
    }
  }

  var server = http.createServer(HandleRequests)
  server.listen(opts.port,opts.host,ready)

  WS(server, function handleSoc (soc) {
  })
}

// allow logins with google app ids


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
