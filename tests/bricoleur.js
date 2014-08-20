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

var placeModules = [
  '+project',
  '+omni',
  'project+omni'
]
brico.write('@edit nimoy')
brico.write('?project')

test('TEST BRICOLEUR', function (t) {
  var gate = 1
  t.plan(1)

 // receive objects
  
  brico.on('data', function (d) { // gate val should be in d
    switch (gate) {
      case 1 : t.equal(d.value === 'project', true, 'found project'); break;
      default : break;
    }
  })

  brico.on('error', function handleError (e) {

  })
})
