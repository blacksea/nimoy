// SERVER

Object._ = function(){} 

var Bricoleur = require('./_brico')
, pre = require('./_pre')
, map = require('./_map')
, rtr = require('./_rtr')
, usr = require('./_usr')
, http = require('http')
, shoe = require('shoe')

// make a new brico for each user var brico = new Bricoleur({scope:'server'});

var server = http.createServer(router.handleRoutes) 
server.listen(80)

var sock = shoe({log:'error'}, function (stream) { 
  var domain = stream.address.address
  stream.on('data', function (data) {
    var obj = JSON.parse(data)
    for (key in obj) {
      if (key==='tmpID') {
        var setID = {}
        setID[obj[key]] = stream.id
        stream.write(JSON.stringify(setID))
        console.dir('binding to '+stream.id)
      }
    }
  })
})

sock.install(server, '/bus')
