// NIMOY 
var argv = require('optimist').argv
var clc = require('cli-color')
var repl = require('./_repl')
var fs = require('fs')

var port 
var host
var wsport

var config = fs.readFileSync('./config.json')

if (argv.port) port = argv.port
if (argv.host) host = argv.host
if (argv.wsport) wsport = argv.wsport

function ready () {
  // start repl
  repl('nimoy v.0.0.1')
}

var nimoy = {
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
function HTTPS (opts, ready) {
  var port = 443
  var wsport = 8080
  var host = 'basilranch.com'
  if (argv.port) port = argv.port
  if (argv.wsport) wsport = argv.wsport
  if (argv.host) host = argv.host

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
function HTTP (opts, ready) {
  var fs = require('fs')
  var http = require('http')
  var gzip = require('zlib').createGzip

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
  var socs = []
  var ws = new wsServer({port:wsport})
  ws.on('connection', function (soc) {
    var wss = websocStream(soc)
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
