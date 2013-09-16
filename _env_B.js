// BROWSER ENVIRONMENT 

if(!Function.prototype.bind) require('bindshim') //kindle jalopy doesn't have bind
var host = window.document.location.host.replace(/:.*/, '')
var ws = require('websocket-stream')
var through = require('through')
var wss = ws('ws://'+host)

var Bricoleur = require('./_brico')

var b = new Bricoleur()

var comfilter = through(function write (chunk) {
  if (typeof chunk === 'string') {
    var d = JSON.parse(chunk)
    if (d.api) b.api.write(d.api)
    if (!d.api) this.queue(chunk)
  }
}, function end () {
  this.emit('end')
}, {autoDestroy:false})

b.addSocket(host, function () {
  wss.pipe(comfilter).pipe(b[host]).pipe(wss)
})

wss.on('open', function () {
  console.log('socket open')
  wss.write(JSON.stringify({api:['test','zorb']}))
})

wss.on('close', function () {
  console.log('server connection closed')
})
