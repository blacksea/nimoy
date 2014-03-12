var test = require('tape')
var level = require('level')
var liveStream = require('level-live-stream')
var db = level('testDB')
liveStream.install(db)
var through = require('through')
var Stream = require('stream').Stream

var map = require('../_map.js')
var bricoleur = require('../bricoleur.js')

var dbWriteStream = db.createWriteStream()

map({wilds : './testModules'}).pipe(dbWriteStream)

dbWriteStream.on('close', function startTest () {

  var brico = new bricoleur(db,{wilds:'./tests/testModules/'})

  db.put('*:m1:1', {}, function (e) {
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

  // test('pipe modules', function (t) {
  //   api.write('put mod1')

  //   grifter = function (d) {
  //     t.equal(d.status,1)
  //     t.end()
  //   }
  // })

  // test('unpipe modules', function (t) {
  //   api.write('put mod1')

  //   grifter = function (d) {
  //     t.equal(d.status,1)
  //     t.end()
  //   }
  // })
  
  // test('list active modules', function (t) {
  //   api.write('put mod1')

  //   grifter = function (d) {
  //     t.equal(d.status,1)
  //     t.end()
  //   }
  // })

})
