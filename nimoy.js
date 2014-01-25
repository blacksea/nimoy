// NIMOY 
// configure | load brico | start net
// brico replicates to client nodes --- client node can have different access priveleges

var http = require('http')
var https = require('https')
var gzip = require('zlib').createGzip
var wsserver = require('ws').Server
var wsstream = require('websocket-stream')
var argv = require('optimist').argv
var through = require('through')
var fs = require('fs')

// CONFIG 
if (argv) var confJSON = argv._[0]
if (!argv) var confJSON = './__conf.json'
var conf = fs.readFileSync(confJSON)
config = JSON.parse(conf)
if (config.dir_static[config.dir_static.length-1] !=='/') config.dir_static += '/'

// SETUP DB
var level = require('level')
var ml = require('multilevel')
var db = level('./'+conf.host) // db saved under host name

// RUN BRICO  
var brico = require('./_brico')(config, db, bootnet)

// NETWORK  
function bootnet (ready) {
  var socs = []
  var server

  var indexHtml = '<html><head></head><body><script src="/'+ config.bundle +'"></script></body></html>'

  if (config.crypto) { 
    var key = fs.readFileSync(config.crypto.key)
    var cert = fs.readFileSync(config.crypto.cert)
    server = https.createServer({key:key,cert:cert}, handleRequests)
  }
  if (!config.crypto) http.createServer(handleRequests)

  function handleRequests (req, res) {
    req.url.substr(0,1)
    console.log(req.url)
    if (req.url === '') {
      res.setHeader('Content-Type', 'text/html')
      res.end(indexHtml)
    } else if (req.url !== '') { // pipe file into req
      var filePath = config.dir_static + req.url
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
      var wss = wsserver(soc) 
      wss.pipe(multilevel.server(db)).pipe(wss) // pipe into db
      wss.on('close', function () {
        for(var i = 0;i<socs.length;i++) {
          if (socs[i].ident == key) socs.splice(i,1); break;
        }
      })
    })
  }

  server.listen(config.port, config.host, installWS)
}
