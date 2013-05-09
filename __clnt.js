var websocket = require('websocket-stream')
, bricoleur = require('./_brico')
, id = null
, host = window.location.host.replace('www.','')
, ws = websocket('ws://'+host)

var brico = new bricoleur()

ws.on('data', function (json) {
  var data = JSON.parse(json)
  console.log(data)

})
