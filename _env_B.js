// BROWSER ENVIRONMENT 

if(!Function.prototype.bind) require('bindshim') //kindle jalopy doesn't have bind
var host = window.document.location.host.replace(/:.*/, '')
var ws = require('websocket-stream')
var wss = ws('ws://'+host)

var Bricoleur = require('./_brico')

var b = new Bricoleur()

//wss.pipe(b.metaStream).pipe(wss) // filter api v. socket

wss.on('open', function () {
  // test API call
  var apiTest = {
    api: ['test', 'sending test msg']
  }
  wss.write(JSON.stringify(apiTest))
})

wss.on('close', function () {
  console.log('server connection closed')
})
