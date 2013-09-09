// BROWSER ENVIRONMENT 
if(!Function.prototype.bind) require('bindshim') //kindle jalopy doesn't have bind
var host = window.document.location.host.replace(/:.*/, '')
var ws = require('websocket-stream')
var wss = ws('ws://'+host)

wss.on('open', function () {
  window.document.title = 'connnnnnn'
})
wss.on('data', function (d) {
  console.log(d)
})
wss.on('end', function () {
  console.log('server close')
})
