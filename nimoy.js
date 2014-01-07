// NIMOY 

// deps
var http = require('http')
var https = require('https')
var gzip = require('zlib').createGzip
var wsserver = require('ws').Server
var wsstream = require('websocket-stream')
var read = require('read')
var argv = require('optimist').argv
var clc = require('cli-color')
var fs = require('fs')

// handle config
var config = fs.readFileSync('./config.json')

// globals
var port 
var host
var wsport

if (argv.port) port = argv.port
if (argv.host) host = argv.host
if (argv.wsport) wsport = argv.wsport

function fileServer (opts, up) {
  var port = 443
  var wsport = 8080
  var host = 'basilranch.com'
  if (argv.port) port = argv.port
  if (argv.wsport) wsport = argv.wsport
  if (argv.host) host = argv.host

  var index = '<html><head><title></title></head><body>'
  +'<script src="'+opts.bundle+'"></script>'
  +'</body></html>'

  if (opts.dir_static[opts.dir_static.length-1] !== '/') opts.dir_static += '/'
  var static = opts.dir_static

  var certs = {key: fs.readFileSync('key.pem'),cert: fs.readFileSync('cert.pem')}
  var server = https.createServer(certs, function HandleReqs (req, res) {
    if (req.headers.host === 'app.'+host) { // manage subdomains
      if (req.url === '/') {
        res.setHeader('Content-Type', 'text/html')
        res.end(HTML)
      } else if (req.url !== '/') {
        var file = fs.createReadStream('./static/'+req.url.replace('/',''))
        file.on('error', function(e) {
          console.error(e)
          res.statusCode = 404
          res.end()
        })
        res.setHeader('Content-Encoding', 'gzip')
        file.pipe(zlib.createGzip()).pipe(res)
      }
    }
  })
  server.listen(port, host, ready)
}

function wsServer (port, cb) {
  var socs = []
  var ws = new wsserver({port:wsport})
  ws.on('connection', function (soc) {
    var wss = wsstream(soc)
    var headers = soc.upgradeReq.headers
    if (headers.origin === 'https;//app.basilranch.com') {
      if (headers['sec-websocket-key']) var key = headers['sec-websocket-key']
      if (!headers['sec-websocket-key']) var key = headers['sec-websocket-key1'].replace(' ','_')
      wss.ident = key //!this is probly not secure?
      socs.push(wss)
      wss.on('close', function () {
        for(var i = 0;i<socs.length;i++) {
          if (socs[i].ident == key) socs.splice(i,1); break;
        }
      })
      wss.pipe(fern(API)).pipe(wss)
    }
  })
}

function REPL (msg) {
  var colors = [
    {f:0,b:11},
    {f:0,b:14},
    {f:0,b:15}
  ]
  var clr = colors[Math.floor(Math.random() * ((colors.length-1) - 0 + 1) + 0)]
  if (msg) console.log(clc.xterm(clr.b)(msg))
  read({}, function handleInput (e,c,d) {
    if (e) console.error(e)
    if (!e) {
      var args = c.match(' ')
      if (args !== null) { 
        c = c.split(' ')
        s.write(c)
        REPL()
      } else {
        s.write(c)
        REPL()
      }
    }
  })
  var s = through(function write (d) {
    this.emit('data',d) 
  }, function end () {
    this.emit('end')
  })
  return s
}
