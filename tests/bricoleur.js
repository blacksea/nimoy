var test = require('tape')
var level = require('level')
var multilevel = require('multilevel')
var ls = require('level-live-stream')
var db = level('./testdb/')
ls.install(db)

var server = multilevel.server(db)
var client = multilevel.client(require('../static/manifest.json'))
server.pipe(client.createRpcStream()).pipe(server)

var library = require('../library.json')
var brico = require('../_bricoleur.js')(client,'edit',library)


test('TEST BRICOLEUR', function (t) {
  t.plan(6)

  var commands = [
    '+project',
    '+omni',
    '?omni',
    '?#omni',
    '+project|omni',
    '+#ral'
  ]

  commands.forEach(function (str) {
    brico.write(str)
  })

 // receive objects
  
  brico.on('data', function (d) { // gate val should be in d
    console.log(d)
    t.equal(d instanceof Array, true)
  })

  brico.on('error', console.error)
})
