// NIMOY 
// configure | load brico | start net
// brico replicates to client nodes --- client node can have different access priveleges

var http = require('http')
var https = require('https')
var gzip = require('zlib').createGzip
var wsserver = require('ws').Server
var wsstream = require('websocket-stream')
var liveStream = require('level-live-stream')
var argv = require('optimist').argv
var browserify = require('browserify')
var through = require('through')
var fs = require('fs')

// CONFIG 
if (argv) var confJSON = argv._[0]
if (!argv._[0]) var confJSON = './__conf.json'
var conf = fs.readFileSync(confJSON)
config = JSON.parse(conf)
if (config.dir_static[config.dir_static.length-1] !=='/') config.dir_static += '/'
if (config.dir_wilds[config.dir_wilds.length-1] !=='/') config.dir_wilds += '/'

// SETUP DB
var level = require('level')
var multilevel = require('multilevel')
var db = level('./'+conf.host) // db saved under host name
liveStream.install(db)

// RUN BRICO  
var bricoleur = require('./_brico')
var brico = new bricoleur(db)
bootnet(function () {
  console.log('net up')
})

// RUN MAP / BUILD BUNDLE
var map = require('./_map')(config.dir_wilds, function (m) {
  var b = browserify('./_client.js')
  for (mod in m) {

    // *only browserify browser modules

    b.require(config.dir_wilds+mod, {expose:mod})
  }
  var bundle = fs.createWriteStream(config.dir_static+'bundle.js')
  var s = b.bundle()
  s.pipe(bundle)
  s.on('end', function putMap () {
    db.put('map', JSON.stringify(m))
  })
})

// NETWORK  
function bootnet (ready) {
  var socs = []
  var server

  var indexHtml = '<html><head></head><body><script src="/bundle.js"></script></body></html>'

  if (config.crypto) { 
    var key = fs.readFileSync(config.crypto.key)
    var cert = fs.readFileSync(config.crypto.cert)
    server = https.createServer({key:key,cert:cert}, handleRequests)
  }
  if (!config.crypto) server = http.createServer(handleRequests)

  function handleRequests (req, res) {
    var url = req.url.substr(1)
    if (url === '') {
      res.setHeader('Content-Type', 'text/html')
      res.end(indexHtml)
    } else if (url !== '') { // pipe file into req
      var filePath = config.dir_static + url
      console.log(filePath)
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
    var ws = new wsserver({server:server})
    ws.on('connection', function (soc) {
      var headers = soc.upgradeReq.headers
      var origin = headers.origin // conn origin
      if (headers['sec-websocket-key']) var key = headers['sec-websocket-key']
      if (!headers['sec-websocket-key']) var key = headers['sec-websocket-key1'].replace(' ','_')
      var wss = wsstream(soc) 
      wss.pipe(multilevel.server(db)).pipe(wss) // pipe into db
      wss.on('close', function () {
        wss.end()
        for(var i = 0;i<socs.length;i++) {
          if (socs[i].ident == key) socs.splice(i,1); break;
        }
      })
      wss.on('error', function (e) {
        console.error(e)
      })
    })
    ready()
  }

  server.listen(config.port, config.host, installWS)
}
