// BROWSER ENVIRONMENT 

if(!Function.prototype.bind) require('bindshim') //kindle jalopy doesn't have bind
var host = window.document.location.host.replace(/:.*/, '')
var ws = require('websocket-stream')
var through = require('through')
var wss = ws('ws://'+host)

var Bricoleur = require('./_brico')

var b = new Bricoleur()

var comfilter = through(function filterAPI (chunk) {
  if (typeof chunk === 'string') {
    var d = JSON.parse(chunk)
    if (d.api) _[host].api.write(d.api)
    if (!d.api) this.queue(chunk)
  }
  // handle non string chunks too ... 
}, function end () {
  this.emit(end)
})
comfilter.autoDestroy = false

wss.pipe(comfilter).pipe(b[host])

b[host].pipe(wss)

wss.on('open', function () {
  console.log('socket open')
})

wss.on('close', function () {
  console.log('server connection closed')
})
