// CLIENT

Object._ = function(){} 

var shoe = require('shoe')
, MuxDemux = require('mux-demux')
, bricoleur = require('./_brico')
, tmp_id = null
, id = null

var brico = new bricoleur({scope:'client'})

var bus = shoe('/bus')

bus.on('connect', function () {
  tmp_id = new Date().getTime(
  console.dir(window.location.host)
  bus.write(JSON.stringify({tmp_id:tmp_id, host:host})

})

bus.on('data', function (json) {
  var data = JSON.parse(json)

  if (typeof data === 'object') console.dir(data)
 
  if (data[tmp_id]) {
    console.dir(data[tmp_id])
    id = data[tmp_id]
  }

  if (data.id === id) { // handle data -- pass to brico
  }
})

setTimeout(function () {
  console.log('sending to ... '+id)
  bus.write(JSON.stringify({id:id, params:['test',2,'r']}))
}, 900)
