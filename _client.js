var manifest = require('./static/manifest.json')
var lib = require('./library.json')
var url = require('url')
var cuid = require('cuid')
var bindshim = require('bindshim')
var wss = require('websocket-stream')
var omni

var ws = (!lib.env.soc || lib.env.soc === 'ws') 
  ? require('websocket-stream')('ws://'+lib.env.host+':'+lib.env.port)
  : require('engine.io-stream')('/ws')

ws.on('error', Errs)

var db = require('multilevel').client(manifest)
           .on('error', Errs)

var bricoleur = require('./_bricoleur')(db,lib)
                  .on('error', Errs)

ws.pipe(db.createRpcStream()).pipe(ws)

function parseUrl (URL) {
  if (URL.preventDefault && URL.newURL) {
    URL.preventDefault()
    URL = URL.newURL
  }

  var canvas
  var loc = url.parse(URL)
  var hash = (loc.hash) ? loc.hash : null

  if (hash && hash.slice(1) === '@') {
    omni = require('./lib/omni.js')({id:cuid()})
    omni.pipe(bricoleur).pipe(omni)
  } else if (hash && hash.slice(1) !== '@') {
    canvas = hash
  } else if (!hash) {
    canvas =  '#home'
  }

  bricoleur.write('!'+canvas)
}

function Errs (err) {
  if (err.code===1) {
    if (omni.write) omni.write({code:1})
  }
}

parseUrl(window.location.href)
window.addEventListener('hashchange', parseUrl, false)
