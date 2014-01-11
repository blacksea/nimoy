// NIMOY 

var http = require('http')
var https = require('https')
var gzip = require('zlib').createGzip
var wsserver = require('ws').Server
var wsstream = require('websocket-stream')
var argv = require('optimist').argv
var through = require('through')
var fs = require('fs')

// CONFIGS
var config = JSON.parse(fs.readFileSync('./config.json'))
if (!config) { config = {port:8000,host:localhost,encrypt:false,dirStatic:'./_static/',dirWilds:'./_wilds/'} } 
if (config.certs.key) var sslKey = fs.readFileSync(config.certs.key)
if (config.certs.cert) var sslCert = fs.readFileSync(config.certs.cert)

// BOOT FLAGS
if (argv) { // allow commandline args to override config
  for (arg in argv) {
    if (config[arg]) config[arg] = argv[arg]
  }
}

function startFileServer (opts, boot) {
  var server
  var port
  var static = opts.dir_static

  var indexHtml = '<html><head></head><body><script src="/'+ config.bundle +'"></script></body></html>'

  if (config.bundle) var bundleFile = config.bundle; config.bundle = fs.readFileSync(config.dirStatic + config.bundle);

  if (config.dirStatic[config.dirStatic.length-1] !== '/') config.dirStatic += '/'
  if (config.dirWilds[config.dirWilds.length-1] !== '/') config.dirWilds += '/'

  if (config.ssl === true) {
    port = config.portHttp
    var certs = {key: sslKey, cert: sslCert}
    server = https.createServer(certs, HandleReqs)
  } else {
    port = config.portHttps
    server = http.createServer(HandleReqs)
  }

  function HandleReqs (req, res) {
    req.url.substr(1,1)
    if (req.url === '') {
      res.setHeader('Content-Type', 'text/html')
      res.end(indexHtml)
    } else if (req.url !== '') {
      var file = fs.createReadStream(config.dirStatic + req.url)
      file.on('error', function(e) {
        console.error(e)
        res.statusCode = 404
        res.end('error 404')
      })
      res.setHeader('Content-Encoding', 'gzip')
      file.pipe(gzip()).pipe(res)
    }
  }
  server.listen(port, config.host, boot)
}

function wsServer (opts)  {
  var socs = []
  if (config.ssl === true) {
    var cfg = {
      ssl:true,
      port: config.portWs,
      ssl_key:sslKey,
      ssl_cert:sslCert
    }
  } else {
    var cfg = {port:config.portWs}
  }
  var ws = new wsserver(cfg)
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

function constructBrico () {
  // assemble brico
  
}

function boot () {

}
