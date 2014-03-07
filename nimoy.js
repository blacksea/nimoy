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
var config = process.argv[2] ? config = require(process.argv[2]) : config = require('./__conf.json') 
if (config.dirModules.slice(-1) !== '/') config.dirModules += '/'
if (config.dirStatic.slice(-1) !== '/') config.dirStatic += '/'


// SETUP MULTILEVEL
var db = level('./'+config.host) 
liveStream.install(db)
multilevel.writeManifest(db, config.dirStatic+'/manifest.json')


// WRITE BROWSER BOOT : an entry point for browserify bundle
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
// WRITE INDEX.HTML
fs.writeFileSync(config.dirStatic+'index.html','<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body><script src="/bundle.js"></script></body></html>')


// LOAD MAP
var map = require('./_map')({ 
  wilds : config.dirModules,
  bundle : config.dirStatic+'bundle.js',
  browserify: config.dirStatic+'boot.js',
  min : config.minify
})
map.on('mapped', function (key,val) {
  db.put(key,val)
})
map.on('bundled', function () {
 var stat = fs.statSync(config.dirStatic+'bundle.js')
 console.log(log('wrote bundle ('+(stat.size/1024).toFixed(2)+'/kb) to '+config.dirStatic+'bundle.js'))
})
map.on('error', console.error)


// LOAD BRICOLEUR
var bricoleur = require('./bricoleur')
brico = bricoleur(db) 
brico.on('error', console.error)


// RUN CLI
if (config.cli === true) {
  var cli = require('./_cli')()
  process.stdin.pipe(cli).pipe(brico).pipe(process.stdout)
}


// RUN SERVER
var file = !config.crypto ? new static.Server(config.dirStatic) : new static.Server(config.dirStatic, {'Strict-Transport-Security':'max-age=31536000'})

var server = !config.crypto ? require('http').createserver(handlerequests) : require('https').createserver({
  key: fs.readfilesync(config.crypto.key),
  cert: fs.readfilesync(config.crypto.cert),
  honorcipherorder: true,
  ecdhcurve: 'prime256v1',
  ciphers: 'ecdh+aesgcm:dh+aesgcm:ecdh+aes256:dh+aes256:ecdh+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS'
}, HandleRequests)

function HandleRequests (req, res) { 
  file.serve(req, res, function ifNoFile (e, result) {
    if (!e) console.log(result)
    if (e) file.serveFile('/index.html',404,{},req,res)
    // write to stream
  })
}

function InstallWebsocket () {
  // verify brico is behind connection somehow
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

server.listen(config.port, config.host, InstallWebsocket)

 
// UTILS
function functionToString (fn) {// takes fn as input, unwraps and returns string
  var s = fn.toString()
  return s.substring(0,s.lastIndexOf('\n')).substring(s.indexOf('\n'),s.length)
}
