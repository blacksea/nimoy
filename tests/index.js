var test = require('tape')
var level = require('level')
var spawn = require('child_process').spawn
var exec = require('child_process').exec
var request = require('request')
var run = require('browser-run')
var br = require('browserify')
var fs = require('fs')

var conf = require('./config.json')
var db = level('../'+conf.host)

var bundle = ''

var testCommands = ['+test','+test|bricoleur','+bricoleur|test']

db.put('#:tst', JSON.stringify(testCommands), function (e) { db.close() })

test('Nimoy Boot Script', function (t) {
  t.plan(2)

  t.on('end', function () { // run browser tests in phantom
    var bunLoc = 'http://'+conf.host+':'+conf.port+'/bundle.js'
    var bun = require('request')(bunLoc)
    bun.on('data', function (d) {
      bundle += d
    })
    bun.on('end', function startPhantom () {
      phantom.write(bundle)
      phantom.write(";window.addEventListener('load',"
        + "function(){window.location.hash='tst'},false);")
      phantom.end()
    })
  })

  var phantom = run()

  var nimoy = spawn('node',['../boot','./tests/config.json'])

  phantom.on('data', function (d) {
    console.log(d)
    if (d.slice(0,4) ==='# ok' || d.slice(0,6) === '# fail') {
      phantom.stop()
      nimoy.kill()
    }
  })

  phantom.on('error', console.error)

  nimoy.stdout.on('data', function (d) {
    var md = d.toString().slice(0,5)
    if (md === 'up on') {
      t.ok(md, 'server runs')
    } else if (md === 'wrote') {
      t.ok(md, 'http request')
    } else console.log(d.toString()) 
  })

  nimoy.stderr.on('data', function (e) {
    console.error('FAIL', e.toString())
    nimoy.kill()
    phantom.stop()
  })
})

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true 
    : false
  return r
}
