var websocket = require('websocket-stream')
, bricoleur = require('./_brico')
, host = window.location.host.replace('www.','')
, ws = websocket('ws://'+host)

ws.on('data', function (buffer) {
  var data = JSON.parse(buffer)
  if (data.client_id) {
    var brico = new bricoleur(data.usr)
    brico.client_id = data.client_id
    ws.pipe(brico.in) 
    brico.out.pipe(ws)
  }
})
