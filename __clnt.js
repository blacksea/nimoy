// CLIENT START SCRIPT
var websocket = require('websocket-stream')
, bricoleur = require('./_brico.js')
, host = window.location.host.replace('www.','')
, ws = websocket('ws://'+host)

var brico = new bricoleur()

setTimeout(function () {
  brico.conn(['console+mdisp'])
}, 3000)

ws.on('data', function (buffer) {
  var data = JSON.parse(buffer)
  console.log(data)
  if (data.id) brico.make(data)
})
