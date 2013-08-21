// CLIENT START SCRIPT
var Bricoleur = require('./_brico.js')
, websocket = require('websocket-stream')
, host = window.location.host.replace('www.','')
, ws = websocket('ws://'+host)

var brico = new Bricoleur()

ws.pipe(brico).pipe(ws)
