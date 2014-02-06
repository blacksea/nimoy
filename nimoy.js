// NIMOY 


var fs = require('fs')
var clc = require('cli-color')
var log = clc.cyanBright
var err = clc.red
var prompt = {prompt:'nimoy:'}


// CONFIG 
if (process.argv[2]) var confJSON = process.argv[2]
if (!process.argv[2]) var confJSON = './__conf.json'
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
multilevel.writeManifest(db, __dirname + '/manifest.json')


// RUN MAP / BROWSERIFY / BOOT / REPL 
var bundle = config.dir_static+'bundle.js' 

var map = require('./_map')({
  prefix: config.spaces.wilds,
  wilds : config.dir_wilds,
  bundle : bundle,
  min : config.minify
})

var dbMapStream = db.createWriteStream({type:'put'})

map.pipe(dbMapStream)

dbMapStream.on('close', function bundleAndBoot () {
  BOOT()
})
             
function BOOT () {
  var stat = fs.statSync(bundle)
  console.log(log('wrote bundle ('+(stat.size/1024).toFixed(2)+'/kb) to '+bundle))

  bootnet(function () {
    console.log(log('network running on port: '+config.port+' host: '+config.host))

    // save conf / clean up before storing
    db.put('config', JSON.stringify(config))

    if (config.repl === true) repl(prompt)

    // RUN BRICO  
    var bricoleur = require('./_brico')
    brico = new bricoleur(db) // maybe don't construct with new?

    brico.on('error', function (e) {
      console.error(e)
    })

    var repl = require('repl') // REPL : pipes into db.writeStream
    process.stdin.pipe(repl).pipe(process.stdout)
  })
}

function bootnet (booted) {
  var http = require('http')
  var https = require('https')
  var gzip = require('zlib').createGzip
  var webSocketServer = require('ws').Server
  var webSocketStream = require('websocket-stream')

  var indexHtml = '<html><head></head><body><script src="/bundle.js"></script></body></html>'

  var server

  if (!config.crypto) 
    server = http.createServer(handleRequests)
  else if (config.crypto) { 
    var key = fs.readFileSync(config.crypto.key)
    var cert = fs.readFileSync(config.crypto.cert)
    server = https.createServer({key:key,cert:cert}, handleRequests)
    delete config.crypto
  } 

  server.listen(config.port, config.host, installWS)

  function handleRequests (req, res) { // more robust: needs paths as well as files
    // should set headers for better security
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
    booted() // NETWORK READY
  }

  function handleSoc (soc) {
    var headers = soc.upgradeReq.headers
    var origin = headers.origin
    var wss = webSocketStream(soc) 
    wss.on('error', function (e) {
      // *note: multiServer sends close after wss is closed / temp ignore
      if (soc.readyState !== 3) console.error(e)
    })
    var multiServer = multilevel.server(db)
    wss.pipe(multiServer).pipe(wss)
  }
}
