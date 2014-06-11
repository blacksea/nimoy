var manifest = require('./static/manifest.json')

var db = require('multilevel').client(manifest)
           .on('error', Errs)

var engine = require('engine.io-stream')
var ws = engine('/ws')
ws.pipe(db.createRpcStream()).pipe(ws)

var buf = (!window.location.hash) 
  ? '!'
  :  window.location.hash.slice(1)

var bricoleur = require('./_bricoleur')(db)
                  .on('error', Errs)
        
bricoleur.write({type:'load', key:'#:'+buf})

window.addEventListener('hashchange', function (e) {
  bricoleur.write({type:'load', key:'#:'+e.newURL.slice(1)})
}, false)

function Errs (err) { console.error(err) }
