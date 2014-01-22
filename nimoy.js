// NIMOY 
var http = require('http')
var https = require('https')
var gzip = require('zlib').createGzip
var wsserver = require('ws').Server
var wsstream = require('websocket-stream')
var argv = require('optimist').argv
var through = require('through')
var fs = require('fs')

var map = require('./_map')
var brico = require('./_brico')

// use multilevel
var level = require('multilevel')

var defaultConfig = {
  port:8000,
  host:localhost,
  dir_static:'./_static/',
  dir_wilds:'./_wilds/'
}

var config = JSON.parse(fs.readFileSync('./config.json'))
if (!config) config = defaultConfig
if (argv) { // BOOT FLAGS: allow commandline args to override config
  for (arg in argv) {
    if (config[arg]) config[arg] = argv[arg]
  }
}

function netStart (opts, ready) {
  var server
  var static = opts.dir_static
  var indexHtml = '<html><head></head><body><script src="/'+ config.bundle +'"></script></body></html>'

  if (!config.crypto) http.createServer(HandleReqs)

  if (config.crypto) {
    if (!config.crypo.port) config.crypto.port = 443
    config.port = config.crypto.port
    var key = fs.readFileSync(config.crypto.key)
    var cert = fs.readFileSync(config.crypto.cert)
    server = https.createServer({key:key,cert:cert}, HandleReqs)
  }

  function HandleReqs (req, res) {
    req.url.substr(1,1)
    if (req.url === '') {
      res.setHeader('Content-Type', 'text/html')
      res.end(indexHtml)
    } else if (req.url !== '') {
      // pipe file
      var file = fs.createReadStream(config.dir_static + req.url)
      file.on('error', function(e) {
        console.error(e)
        res.statusCode = 404
        res.end('error 404')
      })
      res.setHeader('Content-Encoding', 'gzip')
      file.pipe(gzip()).pipe(res)
    }
  }
  server.listen(config.port, config.host, ready)

  var socs = []
  var ws = new wsserver({server:server})
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
    }
  })
}

// new brico
// list bricos
// load/unload brico
// start/stop server
// secure mode
// assemble brico

// brico replicates to client nodes --- client node can have different access priveleges
// span/bridge from client to server 
