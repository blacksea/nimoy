// NIMOY

var fs = require('fs')
var clc = require('cli-color')
var log = clc.cyanBright
var err = clc.red


// CONFIG 

var config
!process.argv[2] ? config = require('./__conf.json') : config = require(process.argv[2])
if (config.dirStatic[config.dirStatic.length-1] !== '/') config.dirStatic += '/'
if (config.dirModules[config.dirModules.length-1] !== '/') config.dirModules += '/'
    

// SETUP DB
 
var level = require('level')
var multilevel = require('multilevel')
var liveStream = require('level-live-stream')
var db = level('./'+config.host) 
liveStream.install(db)
multilevel.writeManifest(db, config.dirStatic + '/manifest.json')


// GENERATE BROWSER CODE ///////////////////////////////////////////////////////////////////
fs.writeFileSync(config.dirStatic+'boot.js', functionToString(function () {// kind of lazy...
// Start Browser Boot
var websocStream = require('websocket-stream')
var host = windowBdocument.location.host.replace(/:.*/, '')
if (window.location.port) host += ':'+window.location.port
if (window.location.protocol === 'https:') var ws = websocStream('wss://' + host)
if (window.location.protocol === 'http:') var ws = websocStream('ws://' + host)

var ml = require('multilevel')
var manifest = require('./manifest.json')
var multiLevel = ml.client(manifest)
var rpc = db.createRpcStream()
ws.pipe(rpc).pipe(ws)

var bricoleur = require('../bricoleur')
var brico = bricoleur(multiLevel)
brico.installMuxDemux(rpc)
brico.on('error', function (e) {
  console.error(e)
})
// End Browser Boot
})) ///////////////////////////////////////////////////////////////////////////////////////


// RUN MAP / BROWSERIFY 

var dbMapStream = db.createWriteStream({type:'put'})
var map = require('./_map')({
  wilds : config.dirModules,
  bundle : config.dirStatic+'bundle.js',
  browserify: config.dirStatic+'boot.js',
  min : config.minify
})
map.pipe(dbMapStream)
dbMapStream.on('close', BOOT)
             

// BOOT SERVER

function BOOT () {
  var stat = fs.statSync(config.dirStatic+'bundle.js')
  console.log(log('wrote bundle ('+(stat.size/1024).toFixed(2)+'/kb) to '+config.dirStatic+'bundle.js'))

  // RUN BRICO  
  var bricoleur = require('./bricoleur')
  brico = bricoleur(db) 
  brico.on('error', console.error)

  bootnet(function () {
    console.log(log('network running on port: '+config.port+' host: '+config.host))
  
    if (config.cli === true) {
      var cli = require('./_cli')()
      process.stdin.pipe(cli).pipe(brico).pipe(process.stdout)
    }
  })
}

function bootnet (booted) {
  var http = require('http')
  var https = require('https')
  var gzip = require('zlib').createGzip
  var protocol
  var server

  if (!config.crypto) {
    server = http.createServer(handleRequests)
    protocol = 'http'
  } else if (config.crypto) { 
    protocol = 'https'
    server = https.createServer({
      key: fs.readFileSync(config.crypto.key),
      cert: fs.readFileSync(config.crypto.cert),
      honorCipherOrder: true,
      ecdhCurve: 'prime256v1',
      ciphers: 'ECDH+AESGCM:DH+AESGCM:ECDH+AES256:DH+AES256:ECDH+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS'
    }, handleRequests)
  } 

  server.listen(config.port, config.host, installWS)

  function handleRequests (req, res) { // more robust: needs paths as well as files
    var url = req.url.substr(1)
    if (url === '') {
      res.setHeader('content-type','text/html')
      if (protocol === 'https') res.setHeader('Strict-Transport-Security','max-age=31536000')
      res.end('<html><head></head><body><script src="/bundle.js"></script></body></html>')
    } else if (url !== '') { // pipe file into req
      var file = fs.createReadStream(config.dirStatic+url)
      res.setHeader('Content-Encoding', 'gzip')
      file.pipe(gzip()).pipe(res)
      file.on('error', function(e) {
        //console.error(e) // handle this properly
        res.statusCode = 404
        res.end('error 404')
      })
    }
  }

  function installWS () {
    var webSocketServer = require('ws').Server
    var ws = new webSocketServer({server:server})
    ws.on('connection', handleSoc)
    booted() // NETWORK READY
  }

  function handleSoc (soc) {
    var headers = soc.upgradeReq.headers
    var id = headers['sec-websocket-key']
    var origin = headers.origin
    var wss = require('websocket-stream')(soc) 
    var levelServer = multilevel.server(db)
    wss.pipe(levelServer).pipe(wss)
    brico.installMuxDemux(levelServer)
    wss.on('error', function (e) {
      if (soc.readyState !== 3) console.error(e)
    })
  }
}


// UTILS
function functionToString (fn) {// takes fn as input, unwraps and returns string
  var s = fn.toString()
  return s.substring(0,s.lastIndexOf('\n')).substring(s.indexOf('\n'),s.length)
}
