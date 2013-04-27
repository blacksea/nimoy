// s e r v e r
var Bricoleur = require('./_brico')
, pre = require('./_pre')
, map = require('./_map')
, rtr = require('./_rtr')
, usr = require('./_usr')
, http = require('http')
, shoe = require('shoe')

// default user sim
var defaultUser = { // default user object
  name:'default',
  domain:'localhost',
  modules:['data']
}

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
  stream.on('data', function (data) {
    var obj = JSON.parse(data) 
    for (key in obj) {
      if (key === 'tmpID') {
        var setID = {}
        setID[obj[key]] = stream.id
        stream.write(JSON.stringify(setID))
      }
    }
  })
})

sock.install(server, '/bus')
