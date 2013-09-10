// BROWSER ENVIRONMENT 
if(!Function.prototype.bind) require('bindshim') //kindle jalopy doesn't have bind
var host = window.document.location.host.replace(/:.*/, '')
var Bricoleur = require('./_brico')
var ws = require('websocket-stream')
var wss = ws('ws://'+host)

var b = new Bricoleur()

wss.pipe(b.metaStream).pipe(wss)

wss.on('open', function () {
  console.log('socket open')
})
wss.on('close', function () {
  console.log('server connection closed')
})
