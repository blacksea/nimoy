var fs = require('fs')
var level = require('level')
var multiLevel = require('multilevel')
var liveStream = require('level-live-stream')
var bricoleur = require('./bricoleur')
var fileServer = require('node-static').Server

var server
var brico
var file

var config = process.argv[2] ? config = require(process.argv[2]) : config = require('./__conf.json') 

if (config.dirModules.slice(-1) !== '/') config.dirModules += '/' 

if (config.dirStatic.slice(-1) !== '/') config.dirStatic += '/'

if (config.crypto) {
  var cipher = 'ecdh+aesgcm:dh+aesgcm:ecdh+aes256:dh+aes256:'
  + 'ecdh+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:'
  + 'RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS'

  config.crypto.key = fs.readfilesync(config.crypto.key)
  config.crypto.cert = fs.readfilesync(config.crypto.cert)
  config.crypto.honorcipherorder = true
  config.crypto.ciphers = cipher

  server = require('https').createServer(config.crypto, HandleRequests)
  file = fileServer(config.dirStatic, {'Strict-Transport-Security':'max-age=31536000'})

} else {
  server = require('http').createServer(HandleRequests)
  file = new fileServer(config.dirStatic) 
}

var db = level('./'+config.host) 
liveStream.install(db)
multiLevel.writeManifest(db, config.dirStatic+'manifest.json')

brico = bricoleur(db) 
brico.on('error', console.error)


// Write boot.js
var indexHtml = '<!doctype html><html lang="en">'
  + '<head><meta charset="utf-8"></head>'
  + '<body><script src="/bundle.js"></script></body>'
  + '</html>'

fs.writeFileSync(config.dirStatic+'index.html', indexHtml)
 
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


var map = require('./_map')({  // make this a stream
  wilds : config.dirModules,
  bundle : config.dirStatic+'bundle.js',
  browserify: config.dirStatic+'boot.js',
  min : config.minify
})
map.on('error', console.error)
map.on('data', function (d) {
  db.put('^',d) 
})
map.on('end', function () {
  // console.log(log('wrote bundle ('+(stat.size/1024).toFixed(2)+'/kb) to '+config.dirStatic+'bundle.js'))
  console.log('nimoy running on host: "'+config.host+'" port: "'+config.port+'"')
  if (config.cli === true) process.stdin.pipe(require('./_cli')()).pipe(brico).pipe(process.stdout)
})


function HandleRequests (req, res) { 
  file.serve(req, res, function ifNoFile (e, result) {
    if (!e) console.log(result)
    if (e) file.serveFile('/index.html',404,{},req,res)
  })
}

function startWebsocket () {
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

server.listen(config.port, config.host, startWebsocket)


// Utils
function functionToString (fn) {// takes fn as input, unwraps and returns string
  var s = fn.toString()
  return s.substring(0,s.lastIndexOf('\n')).substring(s.indexOf('\n'),s.length)
}
