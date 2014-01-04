// BROWSER BOOT 
if (!Function.prototype.bind) require('bindshim')
// fancy console logging colors
var black = 'color:white;background:black;font-size:12;'
var blue = 'color:white;background:blue;font-size:12;'
var red = 'color:white;background:red;font-size:12;'

var websocStream = require('websocket-stream')
var ws = websocStream('ws://app.basilranch.com:8080')

// call api directly OR use stream / objects
var css = 'margin:0;padding:0;overflow:hidden;'
document.body.setAttribute('style', css)
