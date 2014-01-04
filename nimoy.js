// NIMOY 
var argv = require('optimist').argv
var read = require('read')
var clc = require('cli-color')
var pw = require('credential')
var fs = require('fs')

var port 
var host
var wsport

var config = fs.readFileSync('./config.json')

if (argv.port) port = argv.port
if (argv.host) host = argv.host
if (argv.wsport) wsport = argv.wsport

var nimoy = { // change this thing ... 

  map: function (res) {
    var self = this
    var map = require('./_map')
    map(config.wilds, function (m) {
      self.M = m
      res('map complete!')
    })
  },
  start: function (res) {
    var netConfig = {
      port:8000,
      host:'localhost',
      dir_static:'./public'
    }
    netHTTP(netConfig, function listening () {
      res('server running on '+netConfig.port)
    })
  },
  watchify: function (res) {
    var w = require('watchify')
    w.add() // browser side!
    w.on('update', function (ids) {
      var bundleJS = fs.createWriteStream(opts.path_bundle)
      w.bundle().pipe(bundleJS)
      bundleJS.on('end', res)
    })
  }
}


// make REPL a module
function REPL (msg) {
  if (msg) console.log(clc.xterm(clr.b)(msg))
  read({}, function handleInput (e,c,d) {
    if (e) console.error(e)
    if (!e) {
      var args = c.match(' ')
      if (args !== null) { 
        c = c.split(' ')
        nimoy[c[0]](c[1],REPL)
      } else {
        nimoy[c](REPL)
      }
    }
  })
}

var colors = [
  {f:0,b:11},
  {f:0,b:14},
  {f:0,b:15}
]

var clr = colors[Math.floor(Math.random() * ((colors.length-1) - 0 + 1) + 0)]

REPL(clc.xterm(clr.f).bgXterm(clr.b)(' nimoy:0.0.1'))

// impelement better server things
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
