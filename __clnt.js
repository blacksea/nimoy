var websocket = require('websocket-stream')
, bricoleur = require('./_brico')
, id = null
, host = window.location.host.replace('www.','')
, ws = websocket('ws://'+host)

// need to get key and user
var brico = new bricoleur()
ws.pipe(brico.in)
brico.out.pipe(ws)
