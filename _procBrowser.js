// BROWSER ENVIRONMENT 

if(!Function.prototype.bind) require('bindshim') //kindle jalopy doesn't have bind
var host = window.document.location.host.replace(/:.*/, '')
var ws = require('websocket-stream')
var through = require('through')
var wss = ws('ws://'+host)

var Bricoleur = require('./_brico')

var b = new Bricoleur()

b.addSocket(host, function () {
  wss.pipe(b[host]).pipe(wss)
})

wss.on('open', function () {
  console.log('socket open')
  wss.write(JSON.stringify({api:{cmd:'test',msg:'xorb'}}))
})

wss.on('close', function () {
  console.log('server connection closed')
})
