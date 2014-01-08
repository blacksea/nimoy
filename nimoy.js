// NIMOY 

// deps
var http = require('http')
var https = require('https')
var gzip = require('zlib').createGzip
var wsserver = require('ws').Server
var wsstream = require('websocket-stream')
var argv = require('optimist').argv
var through = require('through')
var fs = require('fs')

// handle config
var config = JSON.parse(fs.readFileSync('./config.json'))
if (!config) { config = {port:8000,host:localhost,encrypt:false,dirStatic:'./_static/',dirWilds:'./_wilds/'} } 

if (argv) { // allow commandline args to override config
  for (arg in argv) {
    if (config[arg]) config[arg] = argv[arg]
  }
}

function makeBricoMap (wilds, fin) {
  var asyncMap = require('slide').asyncMap
  var MAP = {}

  function readPkg (modDir, next) {
    var pkg = JSON.parse(fs.readFileSync(wilds+modDir+'/package.json'))
    if (pkg.brico) { 
      MAP[pkg.name] = pkg 
      next() 
    } else next()
  }

  fs.readdir(wilds, function moduleList  (e, modules) {
    if (!e) asyncMap(modules, readPkg, fin)
  })
}

function startFileServer (opts, boot) {

  // how to handle subdomains?
  var server
  var static = opts.dir_static

  var indexHtml = '<html><head></head><body><script src="/'+ config.bundle +'"></script></body></html>'

  if (config.bundle) var bundleFile = config.bundle; config.bundle = fs.readFileSync(config.dirStatic + config.bundle);

  if (config.dirStatic[config.dirStatic.length-1] !== '/') config.dirStatic += '/'
  if (config.dirWilds[config.dirWilds.length-1] !== '/') config.dirWilds += '/'

  if (config.encrypt === true) {
    var certs = {key: fs.readFileSync(config.certs.key),cert: fs.readFileSync(config.certs.cert)}
    server = https.createServer(certs, HandleReqs)
  } else server = http.createServer(HandleReqs)

  function HandleReqs (req, res) {
    req.url.substr(1,1) // remove backslash
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
  server.listen(opts.port, opts.host, boot)
}

function wsServer (opts)  {
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
    }
  })
}

function constructBrico () {
  // assemble brico
  
}

function boot () {

}
