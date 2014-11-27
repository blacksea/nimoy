var _ = require('underscore')
var manifest = require('./static/manifest.json')
var settings = require('./settings.json')
var url = require('url')
var cuid = require('cuid')
var bindshim = require('bindshim')

// add templates to lib?
var wss = require('websocket-stream')

var ws = wss('ws://'+settings.host+':'+settings.port)
 
ws.on('error', Errs)

var db = require('multilevel').client(manifest)
           .on('error', Errs)

ws.pipe(db.createRpcStream()).pipe(ws)

var bricoleur = require('./_bricoleur')(db)
                    .on('error', Errs)

                   
db.get('library', function (e,d) {
  var lib = JSON.parse(d)

  var omni = require('./lib/omni.js')({id:'0mNii',lib:_.clone(lib)})
  omni.pipe(bricoleur).pipe(omni)

  loadCanvas(window.location.href)
})


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
