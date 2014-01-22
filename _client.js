var websocStream = require('websocket-stream')
var host = window.document.location.host.replace(/:.*/, '')
if (window.location.protocol && window.location.protocol === 'https:') var ws = websocStream('wss://'+host)
if (window.location.protocol && window.location.protocol === 'http:') var ws = websocStream('ws://'+host)

var brico = require('./brico')
var level = require('multilevel')
// use websoc to setup && propogate config
