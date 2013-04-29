var shoe = require('shoe')
, stream = require('stream')
, bricoleur = require('./_brico')
, tmp_id = null
, id = null
, host = window.location.host.replace('www.','')

var brico = new bricoleur()

var t = new stream()
t.readable = true

setInterval(function () {
  t.emit('data', 'testing!!!')
}, 300)

t.pipe(brico.in)

var bus = shoe('/bus')

bus.on('connect', function () {
  tmp_id = new Date().getTime()
  bus.write(JSON.stringify({tmp_id:tmp_id, host:host}))
})

bus.on('data', function (json) {
  var data = JSON.parse(json)

  if (typeof data === 'object') console.dir(data)
 
  if (data[tmp_id]) {
    id = data[tmp_id]
  }

  if (data.id === id) { // handle data -- pass to brico
  }
})

setTimeout(function () {
  bus.write(JSON.stringify({id:id, params:['test',2,'r']}))
}, 900)
