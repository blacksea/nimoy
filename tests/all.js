var fs = require('fs')
var http = require('http')
var test = require('tape')
var cuid = require('cuid')
var nimoy = require('../_nimoy')
var hash = require('crypto').createHash
var emitter = require('events').EventEmitter
var multilevel = require('multilevel')
var es = require('engine.io-stream/client')

var _ = require('underscore')
var level = require('level')
var ls = require('level-live-stream')
var db = level('./testdb/')

ls.install(db)
multilevel.writeManifest(db, './static/manifest.json')

var server = multilevel.server(db, {
  auth : nimoy.auth,
  access : function (u,db,m,a) {}
})

var client = multilevel.client(require('../static/manifest.json'))
server.pipe(client.createRpcStream()).pipe(server)

var config = require('../config.json')

var library = {}

library['mod1'] = { name : './tests/mod1' }
library['mod2'] = { name : './tests/mod2' }

brico = require('../_bricoleur.js')(client,'edit',library)
          .on('error', console.error)

var cmds = [
  {cmd:'+@edit nimoy', from:'auth'},
  {cmd:'+mod1', from:'addMod1'},
  {cmd:'+mod2', from:'addMod2'},
  {cmd:'?mod2', from:'findMod2'}
]

test('BRICOLEUR STREAMING API', function (t) {
  var pipe, m1, m2

  var tests = {
    auth : function (d) {
      t.equal(isCuid(d.value),true, 'auth succesfull')
    },
    addMod1 : function (d) {
      t.equal(isCuid(d.value), true, 'placed module1')
      m1 = d.value
    },
    addMod2 : function (d) {
      t.equal(isCuid(d.value), true, 'placed module2')
      m2 = d.value
    },
    findMod2 : function (d) {
      t.equal(d.value instanceof Array, true, 'search complete')
      brico.write({cmd:'+'+m1+'|'+m2,from:'pipe'})
    },
    pipe: function (d) {
      pipe = d.value
      t.equal(isCuid(pipe),true, 'piped modules')
      brico.write({cmd:'+#cvs',from:'save'})
    },
    save: function (d) {
      t.equal(d.value,'#:cvs', 'saved')
      brico.write({cmd:'!#cvs',from:'load'})
    },
    load: function (d) {
      t.equal(d.value,'#:cvs', 'loaded')
      brico.write({cmd:'-'+pipe,from:'unpipe'})
    },
    unpipe: function (d) {
      t.equal(d.value,pipe, 'unpiped modules')
      brico.write({cmd:'-@edit',from:'logout'})
    },
    logout: function (d) {
      t.equal(d.value, 'edit', 'logged out')
    }
  }

  t.plan(_.keys(tests).length)

  cmds.forEach(function (c) {
    brico.write(c)
  })

  brico.on('data', function (d) {
    var path = d.key.split(':')
    var k = path[path.length-1]
    tests[k](d)
  })
})

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') ? true : false
  return r
}

var conf = require('../config.json')
var pass = hash('sha256').update(conf.pass,'utf8').digest('hex')

test('NIMOY COMPILE MODULES', function (t) {
  t.plan(1)
  nimoy.compile(conf, function (e, res) {
    t.ok(res, 'modules compiled!')
  })
})

test('NIMOY BOOT SERVER', function (t) {
  t.plan(3)
  nimoy.boot(conf, function (kill) {

    var indexHTML = fs.readFileSync('./static/index.html',{encoding:'utf8'})
    var getIndex = http.request({
      hostname:conf.host,
      port:conf.port,
      path:'/'
    }, function (res) {
      res.on('data', function (d) {
        t.equal(d.toString(),indexHTML, 'server request ok')
      })
    })
    getIndex.end()

    var ws = es({path:':9999/ws',transports:['websocket']})
    ws.pipe(client.createRpcStream()).pipe(ws)

    var creds = {
      name : 'edit',
      pass : pass
    }

    client.auth(creds, function (e, res) {
      t.equal(isCuid(res.value), true, 'login ok')
      creds.pass = res.value
    })

    setTimeout(function () {
      client.auth(creds, function (e,r) {
        t.equal(isCuid(r.value), true, 'session exists!')
        setTimeout(process.exit, 400)
      })
    }, 30)
  })
})

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') ? true : false
  return r
}
