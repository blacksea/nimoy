var manifest = require('./static/manifest.json')
var lib = require('./library.json')
var url = require('url')
var cuid = require('cuid')

var engine = require('engine.io-stream')
var ws = engine('/ws')

var db = require('multilevel').client(manifest)
           .on('error', Errs)

ws.pipe(db.createRpcStream()).pipe(ws)

var loc = url.parse(window.location.origin)

var user = (loc.host.split('.').length>1) ? loc.host.split('.')[0] : 'unuser'
var canvas = (loc.hash) ? loc.hash : 'home'

var bricoleur = require('./_bricoleur')(db, user, lib)
                  .on('error', Errs)
                  
window.addEventListener('hashchange', function (e) {
  e.preventDefault()
  canvas = (loc.hash) ? loc.hash : 'home'
  bricoleur.write('!'+canvas)
}, false)

if (sessionStorage[user]) 
  bricoleur.write('@'+user+' '+sessionStorage[user])

if (!sessionStorage[user]) 
  bricoleur.write(['+login','+login|bricoleur','+bricoleur|login'])

function Errs (err) { console.error(err) }

bricoleur.on('data', function (d) {
  // look for auth
  // if () {
  //   bricoleur.write(['+omni','+omni|bricoleur','+bricoleur|omni'])
  // }
})
