var Bricoleur = require('./_brico')
, map = require('./_map')
, rtr = require('./_rtr')
, usr = require('./_usr')
, http = require('http')
, fs = require('fs')
, ws = require('ws').Server

var port = 80 // set port

var _usr = new usr() // setup user
var _map = new map({dir:'./_wilds', watch:true, css: './_wilds/_css.styl', js:['./__clnt.js']}) // map _wilds modules

_usr.buildUsers(function (user) { // fix this
   Object[user.host] = new Bricoleur(user) // not too sure about this prob a temp hack
   _map.out.pipe(Object[user.host].in)
})

_map.survey(function (err) {
 console.log('map survey complete')
})

var _rtr = new rtr() // do routing 
var server = http.createServer(_rtr.handleReqs) // handle http requests
server.listen(port)

var wss = new ws({server:server})
wss.on('connection', _rtr.handleSoc)
