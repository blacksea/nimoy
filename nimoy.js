// NIMOY 

var fs = require('fs')

// CONFIG 
var argv = require('optimist').argv
if (argv) var confJSON = argv._[0]
if (!argv._[0]) var confJSON = './__conf.json'
var conf = fs.readFileSync(confJSON)
config = JSON.parse(conf)
if (config.dir_static[config.dir_static.length-1] !== '/') config.dir_static += '/'
if (config.dir_wilds[config.dir_wilds.length-1] !== '/') config.dir_wilds += '/'

// SETUP DB
var level = require('level')
var multilevel = require('multilevel')
var liveStream = require('level-live-stream')
var db = level('./'+config.host) 
liveStream.install(db)

// RUN BRICO  
var bricoleur = require('./_brico')
var brico = new bricoleur(db)

// RUN MAP / BROWSERIFY
var map = require('./_map')({
  wilds : config.dir_wilds,
  bundle : config.dir_static+'bundle.js',
  min : true
}, function putMap (m) {
  db.put('map', m)
})

// BOOT 
bootnet(function () {
  console.log('net up')
})

function bootnet (booted) {
  var http = require('http')
  var https = require('https')
  var gzip = require('zlib').createGzip
  var webSocketServer = require('ws').Server
  var webSocketStream = require('websocket-stream')

  var indexHtml = '<html><head></head><body><script src="/bundle.js"></script></body></html>'

  var server

  if (config.crypto) { 
    var key = fs.readFileSync(config.crypto.key)
    var cert = fs.readFileSync(config.crypto.cert)
    server = https.createServer({key:key,cert:cert}, handleRequests)
  } else if (!config.crypto) 
    server = http.createServer(handleRequests)

  server.listen(config.port, config.host, installWS)

  function handleRequests (req, res) { // more robust: needs paths as well as files
    var url = req.url.substr(1)
    if (url === '') {
      res.setHeader('Content-Type', 'text/html')
      res.end(indexHtml)
    } else if (url !== '') { // pipe file into req
      var filePath = config.dir_static + url
      var file = fs.createReadStream(filePath)
      file.on('error', function(e) {
        console.error(e)
        res.statusCode = 404
        res.end('error 404')
      })
      res.setHeader('Content-Encoding', 'gzip')
      file.pipe(gzip()).pipe(res)
    }
  }

  function installWS () {
    var ws = new webSocketServer({server:server})
    ws.on('connection', handleSoc)
    booted() // NETWORK IS READY
  }

  function handleSoc (soc) {
    var headers = soc.upgradeReq.headers
    var origin = headers.origin
    var wss = webSocketStream(soc) 

    // CONNECT MULTILEVEL
    wss.pipe(multilevel.server(db)).pipe(wss) 

    wss.on('close', wss.end)
    wss.on('error', function (e) {
      console.error(e)
    })
  }
}
