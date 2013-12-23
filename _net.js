// NET

function HTTP (opts, ready) {
  var fs = require('fs')
  var http = require('http')
  var gzip = require('zlib')createGzip

  var index = '<html><head><title></title></head><body>'
  +'<script src="'+opts.bundle+'"></script>'
  +'</body></html>'

  if (opts.dir_static[opts.dir_static.length-1] !== '/') opts.dir_static += '/'
  var static = opts.dir_static

  var server = http.createServer(function handleRequests (req, res) {
    var index = '<html><head><title></title></head><body>'
    +'<script src="'+opts.bundle+'"></script>'
    +'</body></html>'

    if (req.url === '/') {
      res.end(index)
      res.setHeader('Content-Type','text/html')
    } else if (req.url !== '/') {
      var file = fs.createReadStream(static+req.url.replace('/',''))
      res.writeHead(200, {'content-encoding': 'gzip'})
      file.pipe(gzip()).pipe(res)
      file.on('error', function(e) {
        console.error(e)
        res.end('404')
      })
    }
  })
  server.listen(opts.port,opts.host,ready)
}

function WS (port, cb) {
  var ws = require('ws')
  var websocketStream = require('websocket-stream')
  var WebSocket = new ws({port:port})
  WebSocket.on('connection', function handleSoc (soc) {
    var wss = websocketStream(soc)
    var headers = soc.upgradeReq.headers
    var host = headers.host
    var key = headers['sec-websocket-key']
    if (headers['sec-websocket-key1']) key = headers['sec-websocket-key1'].replace(/\s/g,'-')
    cb(soc)
  })
}

function browserStuff () {
  if(!Function.prototype.bind) require('bindshim') 
  var host = window.document.location.host.replace(/:.*/, '')
}

module.exports.HTTP = HTTP
module.exports.WS = WS
