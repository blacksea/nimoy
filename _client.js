var manifest = require('./static/manifest.json')
var lib = require('./library.json')
var url = require('url')
var cuid = require('cuid')
var bindshim = require('bindshim')

var ws = (!lib.env.soc || lib.env.soc === 'ws') 
  ? require('websocket-stream')('ws://'+lib.env.host+':'+lib.env.port)
  : null
 
ws.on('error', Errs)

var db = require('multilevel').client(manifest)
           .on('error', Errs)

ws.pipe(db.createRpcStream()).pipe(ws)

var bricoleur = require('./_bricoleur')(db,lib)
                  .on('error', Errs)

var omni = require('./lib/omni.js')({id:cuid(),lib:lib})

omni.pipe(bricoleur).pipe(omni)

function loadCanvas (loc) {
  loc = (loc.newURL) ? url.parse(loc.newURL) : url.parse(loc)

  var canvas = (loc.path !== '/') 
    ? loc.path.slice(1)
    : (!loc.hash) 
    ? 'home' 
    : loc.hash.slice(1)

  bricoleur.write('!#'+canvas)
}

function Errs (err) {
  if (err.code === 1) 
    if (omni.write) omni.write({code:1})
}

window.addEventListener('hashchange', loadCanvas, false)

window.addEventListener('popstate', function (e) {
  if (e.state) console.log(e.state)
}, false)

loadCanvas(window.location.href)
