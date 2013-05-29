var websocket = require('websocket-stream')
, bricoleur = require('./_brico')
, id = null
, host = window.location.host.replace('www.','')
, ws = websocket('ws://'+host)

var brico = new bricoleur() // need to get key and user
ws.pipe(brico.in)
brico.out.pipe(ws)

ws.on('data', function (buffer) {
  var data = JSON.parse(buffer)
  if (data.client_id) {
    var brico = new bricoleur(data.usr)
    brico.recv(JSON.stringify(data.map))
    brico.client_id = data.client_id
    ws.pipe(brico.in) 
    brico.out.pipe(ws)
  }
})

setTimeout(function () {
  brico.send({test:'test'})
}, 1000)
