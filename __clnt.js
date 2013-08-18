// CLIENT START SCRIPT
var websocket = require('websocket-stream')
, bricoleur = require('./_brico.js')
, host = window.location.host.replace('www.','')
, ws = websocket('ws://'+host)

var brico = new bricoleur()

ws.pipe(brico)

// ws.on('data', function (buffer) {
//   console.log(buffer)
//   var data = JSON.parse(buffer)
//   if (data.client_id) {
//     var brico = new bricoleur(data.usr)
//     brico.map.client = data.map
//     brico.client_id = data.client_id
//     ws.pipe(brico.in) 
//     brico.out.pipe(ws)
//     brico.build()
//   }
// })
