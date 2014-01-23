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

// CONFIG 

var config = JSON.parse(fs.readFileSync('./config.json'))
if (!config) console.error('please provide config.json')
if (argv) { // BOOT FLAGS: allow commandline args to override config
  for (arg in argv) {
    if (config[arg]) config[arg] = argv[arg]
  }
}

// NETWORK  

var socs = []
var wss

function bootBrico (ready) {

}

function bootNet (ready) {
  var indexHtml = '<html><head></head><body><script src="/'+ config.bundle +'"></script></body></html>'

  if (config.crypto) {
    if (!config.crypo.port) config.crypto.port = 443
    config.port = config.crypto.port
    var key = fs.readFileSync(config.crypto.key)
    var cert = fs.readFileSync(config.crypto.cert)
    server = https.createServer({key:key,cert:cert}, handleRequests)
  }
  if (!config.crypto) http.createServer(handleRequests)

  function handleRequests (req, res) {
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

  server.listen(config.port, config.host, function serverReady () {
    var ws = new wsserver({server:server})
    ws.on('connection', function (soc) {
      wss = wsserver(soc) 
      wss.pipe(db.createRpcStream()).pipe(wss)// pipe into db
    })
  })
}

// brico

// setup db
var level = require('level')
var liveStream = require('level-live-stream')
var ml = require('multilevel')
var db = level('./data') // db should use brico user name
var ls = liveStream(db)
liveStream.install(db)

// MAP  
map(config.wilds, function (m) {

})

// list bricos
// load/unload brico
// start/stop server
// secure mode
// assemble brico
// brico replicates to client nodes --- client node can have different access priveleges
// span/bridge from client to server 

// var headers = soc.upgradeReq.headers
//   if (headers.origin === 'https;//app.basilranch.com') {
//   if (headers['sec-websocket-key']) var key = headers['sec-websocket-key']
//   if (!headers['sec-websocket-key']) var key = headers['sec-websocket-key1'].replace(' ','_')
//   wss.ident = key //!this is probly not secure?
//   socs.push(wss)
//   wss.on('close', function () {
//     for(var i = 0;i<socs.length;i++) {
//       if (socs[i].ident == key) socs.splice(i,1); break;
//     }
//   })
//   wss.pipe(ml.server(db)).pipe(wss)
// }
