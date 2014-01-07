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
if (!config) { config = {port : 8000,host : localhost,encrypt : false,dirStatic : './_static/',dirWilds : './_wilds/'} } 

if (argv) { // allow commandline args to override config
  for (arg in argv) {
    if (config[arg]) config[arg] = argv[arg]
  }
}

// WILDS MAPPER
var asyncMap = require('slide').asyncMap

module.exports = function (path, ready) {
  var MAP = {}

  function readPKG (fileName, next) {
    var pkgFile = fs.readFileSync(path+fileName+'/package.json')
    var pkg = JSON.parse(pkgFile)
    if (pkg.brico) {
      s.write(buf)
      MAP[fileName] = pkg
      next() 
    } else {
      next()
    }
  }

  if (path[path.length-1] !== '/') path += '/'

  fs.readdir(path, function moduleList(e, modules) {
    asyncMap(modules, readPKG, function () {
      ready(JSON.stringify(MAP,null,2))
    })
  })

  var s = through(function write (chunk) {
    self.emit('data', chunk)
  }, function end () {
    this.end()
  },{autoDestroy:false})

  return s
}

function fileServer (opts, up) {

  // how to handle subdomains?

  var server
  var static = opts.dir_static

  var indexHtml = '<html><head></head><body><script src="/'+ config.bundle +'"></script></body></html>'

  if (config.bundle) {
    config.bundle = fs.readFileSync
  }

  if (config.dirStatic[config.dirStatic.length-1] !== '/') config.dirStatic += '/'
  if (config.dirWilds[config.dirWilds.length-1] !== '/') config.dirWilds += '/'

  if (config.encrypt === true) {
    var certs = {key: fs.readFileSync(config.certs.key),cert: fs.readFileSync(config.certs.cert)}
    server = https.createServer(certs, HandleReqs)
  } else {
    server = http.createServer(HandleReqs)
  }

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
  server.listen(opts.port, opts.host, up)
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
