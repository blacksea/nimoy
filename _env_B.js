// BROWSER ENVIRONMENT 

if(!Function.prototype.bind) require('bindshim') //kindle jalopy doesn't have bind
var host = window.document.location.host.replace(/:.*/, '')
var ws = require('websocket-stream')
var through = require('through')
var filter = require('filter-stream')
var wss = ws('ws://'+host)

var Bricoleur = require('./_brico')

var b = new Bricoleur()

var comfilter = filter({key:'api',stream:b.api})

b.addSocket(host, function () {
  wss.pipe(comfilter).pipe(b[host]).pipe(wss)
})

wss.on('open', function () {
  console.log('socket open')
})

wss.on('close', function () {
  console.log('server connection closed')
})
