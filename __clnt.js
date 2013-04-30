var websocket = require('websocket-stream')
, bricoleur = require('./_brico')
, id = null
, host = window.location.host.replace('www.','')
, ws = websocket('ws://'+host)

var brico = new bricoleur()

ws.on('data', function (json) {
  var data = JSON.parse(json)
  if (data.new_id) {
    id = data.new_id
    ws.write(JSON.stringify({newConn:host,id:id}))
    ws.pipe(brico.in)
    brico.out.pipe(ws)
  }
  if (data.id===id) { // handle data
    console.log(data)
  }
})
