// BROWSER ENVIRONMENT 
if(!Function.prototype.bind) require('bindshim') //kindle jalopy doesn't have bind
var ws = require('websocket-stream');
var wss = ws('ws://192.168.1.76/');

wss.on('data', function (d) {
  var c =document.getElementById('container')
  c.innerHTML = d
})
