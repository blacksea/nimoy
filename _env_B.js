// BROWSER ENVIRONMENT 

if(!Function.prototype.bind) require('bindshim') //kindle jalopy doesn't have bind
var host = window.document.location.host.replace(/:.*/, '')
var ws = require('websocket-stream')
var through = require('through')
var wss = ws('ws://'+host)

var Bricoleur = require('./_brico')

var b = new Bricoleur()

b.addSocket(host, function () {
  var s = through(function write (chunk) {
    if (typeof chunk === 'string') {
      var d = JSON.parse(chunk)
      if (d.api) b.api.write(d.api)
      if (!d.api) b[host].write(d)
    }
  }, function end () {

  })
  s.autoDestroy = false
  wss.pipe(s).pipe(wss)
})

// split comm into 2 layers ENV/BRICO
// ENV DIRECT / BRICO SOCKET 

wss.on('open', function () {
  console.log(wss)
})

wss.on('close', function () {
  console.log('server connection closed')
})
