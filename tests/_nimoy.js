var fs = require('fs')
var http = require('http')
var test = require('tape')
var cuid = require('cuid')
var nimoy = require('../_nimoy')
var hash = require('crypto').createHash
var emitter = require('events').EventEmitter
var multilevel = require('multilevel').client()
var es = require('engine.io-stream/client')

var conf = require('../config.json')
var pass = hash('sha256').update(conf.pass).digest('hex')

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
    ws.pipe(multilevel.createRpcStream()).pipe(ws)

    var creds = {
      name : 'edit',
      pass : pass
    }

    multilevel.auth(creds, function (e, res) {
      t.equal(isCuid(res.value), true, 'login ok')
      creds.pass = res.value
    })

    setTimeout(function () {
      multilevel.auth(creds, function (e,r) {
        t.equal(isCuid(r.value), true, 'session exists!')
      })
    }, 30)
  })
})

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') ? true : false
  return r
}
