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
      cb(null, {value:sess})
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

library['mod1'] = {
  name : './tests/mod1'
}

library['mod2'] = {
  name : './tests/mod2'
}

var brico = require('../_bricoleur.js')(client,'edit',library)
              .on('error', console.error)

var cmds = [
  {cmd:'+@edit nimoy', from:'auth'},
  {cmd:'+mod1', from:'add-mod1'},
  {cmd:'+mod2', from:'add-mod2'},
  {cmd:'?mod2', from:'find-mod2'}
]

test('TEST BRICOLEUR', function (t) {
  t.plan(9)

  var pipe, m1, m2

  cmds.forEach(function (c) {
    brico.write(c)
  })

  brico.on('data', function (d) {
    if (d.key.match(cmds[0].from)) {
      t.equal(d.value,sessions['edit'][0], 'auth succesfull')
    }
    if (d.key.match(cmds[1].from)) {
      t.equal(isCuid(d.value), true, 'placed module1')
      m1 = d.value
    }
    if (d.key.match(cmds[2].from)) {
      t.equal(isCuid(d.value), true, 'placed module2')
      m2 = d.value
    }
    if (d.key.match(cmds[3].from)) {
      t.equal(d.value instanceof Array, true, 'search complete')
      brico.write({cmd:'+'+m1+'|'+m2,from:'pipe'})
    }
    if (d.key.slice(2) === 'pipe') {
      pipe = d.value
      t.equal(isCuid(pipe),true, 'piped modules')
      brico.write({cmd:'+#cvs',from:'save'})
    }
    if (d.key.match('save')) {
      t.equal(d.value,'#:cvs', 'saved')
      brico.write({cmd:'!#cvs',from:'load'})
    }
    if (d.key.match('load')) {
      t.equal(d.value,'#:cvs', 'loaded')
      brico.write({cmd:'-'+pipe,from:'unpipe'})
    }
    if (d.key.match('unpipe')) {
      t.equal(d.value,pipe, 'unpiped modules')
      brico.write({cmd:'-@edit',from:'logout'})
    }
    if (d.key.match('logout')) {
      t.equal(d.value, 'edit', 'logged out')
    }
  })
})

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') ? true : false
  return r
}
