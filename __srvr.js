// SERVER

Object._ = function(){} 

var Bricoleur = require('./_brico')
, pre = require('./_pre')
, map = require('./_map')
, rtr = require('./_rtr')
, usr = require('./_usr')
, http = require('http')
, shoe = require('shoe')

/* dynamic route loading somewhow?
set environment!?!
define application routes
load user (simplest/hackable user model)
fastest way to lookup usr model/tree ? async call
*/

var _rtr = new rtr(usr.dflt.rts)
var server = http.createServer(_rtr.handleRoutes) 
server.listen(80)

var _map = new map('./_wilds')
var _pre = new pre()
_map.out.pipe(_pre.in)

// handle socket connections:bind to user? pass stream into user instance !?
var sock = shoe({log:'error'}, function (stream) { 
  var domain = stream.address.address
  console.log(domain)
  stream.on('data', function (data) {
    var obj = JSON.parse(data)
    for (key in obj) {
      if (key==='tmpID') {
        var setID = {}
        setID[obj[key]] = stream.id
        stream.write(JSON.stringify(setID))
      }
    }
  })
})

sock.install(server, '/bus')
