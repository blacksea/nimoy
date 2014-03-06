// NIMOY

var fs = require('fs')
var clc = require('cli-color')
var log = clc.cyanBright
var err = clc.red
var level = require('level')
var multilevel = require('multilevel')
var liveStream = require('level-live-stream')
var static = require('node-static')


// CONFIGURATION  
var config
!process.argv[2] ? config = require('./__conf.json') : config = require(process.argv[2])
if (config.dirStatic[config.dirStatic.length-1] !== '/') config.dirStatic += '/'
if (config.dirModules[config.dirModules.length-1] !== '/') config.dirModules += '/'


// SETUP MULTILEVEL
var db = level('./'+config.host) 
liveStream.install(db)
multilevel.writeManifest(db, config.dirStatic+'/manifest.json')


// GENERATE BROWSER CODE //////////////////////////////////////////////////
// Write boot.js : an entry point for browserify bundle
fs.writeFileSync(config.dirStatic+'boot.js', functionToString(function () {
// Start Browser Boot 
  
var websocStream = require('websocket-stream')
var host = window.document.location.host.replace(/:.*/, '')
if (window.location.port) host += (':'+window.location.port)
if (window.location.protocol === 'https:') var ws = websocStream('wss://' + host)
if (window.location.protocol === 'http:') var ws = websocStream('ws://' + host)

var ml = require('multilevel')
var manifest = require('./manifest.json')
var multiLevel = ml.client(manifest)
var rpc = multiLevel.createRpcStream()
ws.pipe(rpc).pipe(ws)

var bricoleur = require('../bricoleur')
var brico = bricoleur(multiLevel)
brico.installMuxDemux(rpc)
brico.on('error', function (e) {
  console.error(e)
})

// End Browser Boot
})) 
// Write index.html
fs.writeFileSync(config.dirStatic+'index.html','<html><head></head><body><script src="/bundle.js"></script></body></html>')


// LOAD BRICOLEUR
var bricoleur = require('./bricoleur')
brico = bricoleur(db) 
brico.on('error', console.error)


// LOAD MAP
var map = require('./_map')({ 
  wilds : config.dirModules,
  bundle : config.dirStatic+'bundle.js',
  browserify: config.dirStatic+'boot.js',
  min : config.minify
})
map.on('map', function (key,val) {
  db.put(key,val)
})
map.on('end', function () {
 var stat = fs.statSync(config.dirStatic+'bundle.js')
  console.log(log('wrote bundle ('+(stat.size/1024).toFixed(2)+'/kb) to '+config.dirStatic+'bundle.js'))
})
map.on('error', console.error)


// RUN CLI
if (config.cli === true) {
  var cli = require('./_cli')()
  process.stdin.pipe(cli).pipe(brico).pipe(process.stdout)
}


// NETWORK ///////////////////////////////////
var file = new static.Server(config.dirStatic)

function HandleRequests (req, res) { 
  var secure = req.connection.encrypted 
  if (secure===true) res.setHeader('Strict-Transport-Security','max-age=31536000')

  file.serve(req, res, handlePath)

  function handlePath (e, result) {
    if (e) res.end('404')
    if (!e) console.log(result)
    // res.setHeader('content-type','text/html')
    // if (secure===true) res.setHeader('Strict-Transport-Security','max-age=31536000')
    // res.end('<html><head></head><body><script src="/bundle.js"></script></body></html>')
  }
}

function InstallWebsocket () {
  var webSocketServer = require('ws').Server
  var ws = new webSocketServer({server:server})
  ws.on('connection', function handleSoc (soc) {
    var wss = require('websocket-stream')(soc) 
    var levelServer = multilevel.server(db)
    brico.installMuxDemux(levelServer)
    wss.pipe(levelServer).pipe(wss)
    wss.on('error', console.error)
  })
}

var server

!config.crypto ? server = require('http').createServer(HandleRequests) : server = require('https').createServer({
  key: fs.readFileSync(config.crypto.key),
  cert: fs.readFileSync(config.crypto.cert),
  honorCipherOrder: true,
  ecdhCurve: 'prime256v1',
  ciphers: 'ECDH+AESGCM:DH+AESGCM:ECDH+AES256:DH+AES256:ECDH+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS'
}, HandleRequests)

server.listen(config.port, config.host, InstallWebsocket)
/////////////////////////////////////////////////////////

// UTILS
function functionToString (fn) {// takes fn as input, unwraps and returns string
  var s = fn.toString()
  return s.substring(0,s.lastIndexOf('\n')).substring(s.indexOf('\n'),s.length)
}
