// s e r v e r
var Bricoleur = require('./_brico')
, pre = require('./_pre')
, map = require('./_map')
, rtr = require('./_rtr')
, usr = require('./_usr')
, http = require('http')
, shoe = require('shoe')

var _usr = new usr()
_usr.buildUsers(function (user) {
  Object['_'+user.name] = new Bricoleur(user) // not too sure about this prob a temp hack
  console.dir(Object)
})

var _rtr = new rtr()
var server = http.createServer(_rtr.handleReqs) 
server.listen(80)

var _map = new map('./_wilds')
var _pre = new pre({js:['./__clnt.js'],css:'./_wilds/_css',compress:true})
_map.out.pipe(_pre.in)

var sock = shoe({log:'error'}, function (stream) { 
  var domain = stream.address.address // extend sockjs/shoe?
  // how to handle connections -- create a relationship between > usr > brico
  // | bind brico | conn id/domain and pass in stream
  stream.on('data', _rtr.handleData) // pipe into router
})

sock.install(server, '/bus')
