var test = require('tape')
var level = require('level')
var multilevel = require('multilevel')
var ls = require('level-live-stream')
var db = level('./testdb/')
var cuid = require('cuid')
var hash = require('crypto-browserify/create-hash')

ls.install(db)

// use nimoy to manage sessions & to compile module library

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
              .on('error', console.error)

var cmds = [
  {cmd:'+@edit nimoy', from:'auth'},
  {cmd:'+mod1', from:'add-mod1'},
  {cmd:'+mod2', from:'add-mod2'},
  {cmd:'?mod2', from:'find-mod2'},
]

test('TEST BRICOLEUR', function (t) {
  t.plan(7)
  brico.on('data', function (d) {
    if (d.key.match(cmds[0].from)) {

    }
    if (d.key.match(cmds[1].from)) {

    }
    if (d.key.match(cmds[2].from)) {

    }
    if (d.key.match(cmds[3].from)) {

    }
    if (d.key.match(cmds[4].from)) {
      brico.write({cmd:'+'+m1+'|'+m2,from:'pipe'})
    }
    if (d.key.match('pipe')) {

    }
    if (d.key.match('unpipe')) {

    }
    if (d.key.match('logout')) {

    }
  })
})
