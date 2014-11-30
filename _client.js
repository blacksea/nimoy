var _ = require('underscore')
var manifest = require('./static/manifest.json')
var settings = require('./settings.json')
var url = require('url')
var cuid = require('cuid')
var bindshim = require('bindshim')

window.openUrl = require('./lib/openUrl.js')

// add templates to lib?
var bricoleur
var wss = require('websocket-stream')

var ws = wss('ws://'+settings.host+':'+settings.port)
 
ws.on('error', Errs)

var db = require('multilevel').client(manifest)
           .on('error', Errs)

ws.pipe(db.createRpcStream()).pipe(ws)

db.get('$:library', function (e,d) {
  var lib = JSON.parse(d)

  bricoleur = require('./_bricoleur')(db,lib)
                    .on('error', Errs)

  var omni = require('./lib/omni.js')({id:'0mNii',lib:_.clone(lib)})
  omni.pipe(bricoleur).pipe(omni)
  openUrl.pipe(bricoleur)

  openUrl.write(window.location.pathname)
})

function Errs (err) {
  if (err.code === 1) 
    if (omni.write) omni.write({code:1})
}

// window.addEventListener('hashchange', loadCanvas, false)

window.addEventListener('popstate', function (e) {
  if (e.state) console.log(e.state)
}, false)
