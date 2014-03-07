var fs = require('fs')
var level = require('level')
var multiLevel = require('multilevel')
var liveStream = require('level-live-stream')
var fileServer = require('node-static').Server
var webSocketStream = require('websocket-stream')
var webSocketServer = require('ws').Server
var bricoleur = require('./bricoleur')
var mappify = require('./_map')

var server
var brico
var file
var db

var config = process.argv[2] ? config = require(process.argv[2]) : config = require('./__conf.json') 

if (config.modules.slice(-1) !== '/') config.modules += '/' 
if (config.static.slice(-1) !== '/') config.static += '/'

if (config.crypto) {
  var cipher = 'ecdh+aesgcm:dh+aesgcm:ecdh+aes256:dh+aes256:'
  + 'ecdh+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:'
  + 'RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS'

  server = require('https').createServer({
    key : fs.readfilesync(config.crypto.key),
    cert : fs.readfilesync(config.crypto.cert),
    honorcipherorder : true,
    ciphers : cipher
  }, doHttp)

  file = new fileServer(config.static, {'Strict-Transport-Security':'max-age=31536000'})
}

if (!config.crypto) {
  server = require('http').createServer(doHttp)
  file = new fileServer(config.static) 
}

function doHttp (req, res) { 
  file.serve(req, res, function thereIsNoFile (e, result) {
    if (e) file.serveFile('/index.html',404,{},req,res)
    // also pass to brico
  })
}

server.listen(config.port, config.host, function setupWebSocket () {
  var ws = new webSocketServer({server:server})

  ws.on('connection', function newSocketConnection (soc) {
    var levelServer = multiLevel.server(db)
    var wss = webSocketStream(soc) 

    wss.pipe(levelServer).pipe(wss)

    wss.on('error', function (e) {
      console.error('webSocStreamErr: '+e)
    })

    brico.installMuxDemux(levelServer)
  })
})


db = level('./'+config.host) 
liveStream.install(db)
multiLevel.writeManifest(db, config.static+'manifest.json')

brico = bricoleur(db) 
brico.on('error', console.error)


var browserBootScript = config.static+'boot.js'

writeBrowserFiles(function thenMappify () {
  var dbWriteStream = db.createWriteStream({valueEncoding:'json'})

  mappify({
    wilds : config.modules,
    bundle : config.static+'bundle.js',
    browserify : browserBootScript,
    min : config.minify
  }).pipe(dbWriteStream)

  dbWriteStream.on('error', console.error)

  dbWriteStream.on('close', function () {
    // console.log(log('wrote bundle ('+(stat.size/1024).toFixed(2)+'/kb) to '+config.static+'bundle.js'))
    console.log('nimoy running on host: "'+config.host+'" port: "'+config.port+'"')
    if (config.cli === true) process.stdin.pipe(require('./_cli')()).pipe(brico).pipe(process.stdout)
  })
})


function writeBrowserFiles (written) {

  var indexHtml = '<!doctype html><html lang="en">'
    + '<head><meta charset="utf-8"></head>'
    + '<body><script src="/bundle.js"></script></body>'
    + '</html>'

  fs.writeFileSync(config.static+'index.html', indexHtml)
   
  fs.writeFileSync(browserBootScript, thisFnBodyToString(function () {
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
  ws.on('error', function (e) {
    console.error(e)
  })

  var bricoleur = require('../bricoleur')
  var brico = bricoleur(multiLevel)
  brico.installMuxDemux(rpc)
  brico.on('error', function (e) {
    console.error(e)
  })
  // End Browser Boot
  })) 

  written()
}


// Utils
function thisFnBodyToString (fn) {// takes fn as input, unwraps and returns string
  var s = fn.toString()
  return s.substring(0,s.lastIndexOf('\n')).substring(s.indexOf('\n'),s.length)
}
