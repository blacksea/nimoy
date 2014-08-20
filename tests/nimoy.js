var fs = require('fs')
var http = require('http')
var test = require('tape')
var emitter = require('events').EventEmitter
var manifest = require('../static/manifest.json')
var multilevel = require('multilevel').client(manifest)
var nimoy = require('../nimoy')
var es = require('engine.io-stream/client')
var cuid = require('cuid')
var hmac = require('crypto').createHmac
var exec = require('child_process').exec

var conf = {
  server : {
    port : 8000,
    host : "localhost",
    ssl : false,
    sessionLength : 20
  },
  bricoleur : {
    secretKey : "PleaseReplaceThisTextWithYourOwn!", 
    rendering : "browser",
    editor : "omni",
    pass : "nimoy"
  },
  bundle : {
    compress : false,
    pathModules : "./node_modules/",
    pathBundleEntry : "./_client.js",
    pathBundleOut : "./static/bundle.js"
  }
}

test('NIMOY: require(nimoy) returns nimoy emitter', function (t) {
  t.plan(2)
  var n = nimoy(conf)
  t.equal(n instanceof emitter, true, 'nimoy is an eventEmitter')
  t.equal(n['compile'] instanceof Function, true, 'nimoy has compile method')
})

test('NIMOY: compile modules', function (t) {
  t.plan(1)
  var n = nimoy(conf)
  n.compile()
  n.on('compiled', function (res) { 
    var exists = fs.existsSync('./library.json')
    t.equal(exists, true, 'created library.json')
  })
})

test('NIMOY: boot', function (t) {
  var c = conf.server
  var n = nimoy(conf)
  var indexHTML = fs.readFileSync('./static/index.html',{encoding:'utf8'})
  n.boot()

  n.on('boot', function () {
    var idx = http.request({
      hostname:c.host,
      port:c.port,
      path:'/'
    }, function (res) {
      res.on('data', function (d) {
        t.equal(d.toString(),indexHTML, 'server request ok')
      })
    })

    var ws = es({path:':8000/ws',transports:['websocket']})
    ws.pipe(multilevel.createRpcStream()).pipe(ws)

    var pass = hmac('sha256', conf.bricoleur.secretKey)
    pass.setEncoding('hex')
    pass.write('nimoy')
    pass.end()

    var creds = {
      name : 'edit',
      pass : pass.read().toString(),
      id : cuid()
    }

    var ls = multilevel.liveStream()
    multilevel.on('open', function () {
      multilevel.get('test', function (e,res) {
        t.equal(e instanceof Error, true)
        t.test('NIMOY: test sessions', function (st) {
          multilevel.auth(creds, function (e, res) {
            st.equal(!e, true, 'login ok')
            delete creds.pass
          })
          setTimeout(function () {
            multilevel.auth(creds, function (e,r) {
              st.equal(!e, false, 'session exists')
              st.end()
              t.end()
              process.exit()
            })
          }, 30)
        })
      })
    })

    ws.on('error', console.error)
    multilevel.on('error', console.error)
    idx.end()
  })
})
