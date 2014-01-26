// CLIENT

var websocStream = require('websocket-stream')
var host = window.document.location.host.replace(/:.*/, '')
if (window.location.protocol === 'https:') var ws = websocStream('wss://'+host)
if (window.location.protocol === 'http:') var ws = websocStream('ws://'+host)

var ml = require('multilevel')
var liveStream = require('level-live-stream')
var db = ml.client()
liveStream.install(db)
ws.pipe(db.createRpcStream()).pipe(ws)

var bricoleur = require('./_brico')
var brico = new bricoleur(db)
