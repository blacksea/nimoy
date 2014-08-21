var test = require('tape')
var level = require('level')
var multilevel = require('multilevel')
var ls = require('level-live-stream')
var db = level('./testdb/')
var cuid = require('cuid')
var hash = require('crypto-browserify/create-hash')

ls.install(db)

var sessions = {edit:[]}
var pass = hash('sha256').update('nimoy').digest('hex')

var server = multilevel.server(db, {
  auth : function (user, cb) {
    if (!user.token && pass===user.pass) {
      var sess = cuid()
      sessions[user.name].push(sess)
      cb(null, {token:sess})
      return null
    } else if (user.token) {
      var exists = _.find(session[user.name],function (s) {
        if(s===user.token) return true
      })
      if (exists) cb(null, {token:user.token})
    } else cb(new Error('bad login!'), null)
  },
  access : function (u,db,m,a) {}
})

var client = multilevel.client(require('../static/manifest.json'))
server.pipe(client.createRpcStream()).pipe(server)

var library = require('../library.json')
var brico = require('../_bricoleur.js')(client,'edit',library)

test('TEST BRICOLEUR', function (t) {
  t.plan(6)

  var commands = [
    '+@edit nimoy',
    '?project',
    '?omni',
    '+project|omni',
    '?omni',
    '+#test',
    '?#test'
  ]

  commands.forEach(function (str) {
    brico.write(str)
  })

  brico.on('data', function (d) { // gate val should be in d
    console.log(d)
    t.equal(d instanceof Array, true)
  })

  brico.on('error', console.error)
})
