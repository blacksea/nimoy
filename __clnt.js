// CLIENT START SCRIPT
var Bricoleur = require('./_brico.js')
, websocket = require('websocket-stream')
, host = window.location.host.replace('www.','')
, ws = websocket('ws://'+host)

var brico = new Bricoleur()

ws.on('data', function (buf) {
  var d = JSON.parse(buf.toString())
  if (d.k) {
    brico.addSoc(d.k, function connectionAdded () {
      ws.pipe(brico[d.k]).pipe(ws)
    })
  }
})
