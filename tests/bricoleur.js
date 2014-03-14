var test = require('tape')
var level = require('level')
var liveStream = require('level-live-stream')
var db = level('testDB')
liveStream.install(db)
var through = require('through')
var Stream = require('stream').Stream

var map = require('../_map.js')
var bricoleur = require('../_bricoleur.js')

var dbWriteStream = db.createWriteStream()

map({wilds : './testModules'}).pipe(dbWriteStream)

dbWriteStream.on('close', function startTest () {

  var brico = new bricoleur(db,{wilds:'./tests/testModules/'})


  db.put('*:m1:1', {}, function (e) {
    test('is api installed ?', function (t) {
      t.equal(brico.api instanceof Stream, true)
      t.end()
    })
    test('del module', function (t) {
      t.plan(1)
      t.equal(brico._['m1_1'] instanceof Stream, true)
    })
    db.del('*:m1:1', function (e) {
      test('put module', function (t) {
        t.plan(1)
        t.equal(!brico._['m1_1'], true)
      })
    })
  })

})
