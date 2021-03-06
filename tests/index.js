var test = require('tape')
var level = require('level')
var spawn = require('child_process').spawn
var exec = require('child_process').exec
var request = require('request')
var run = require('browser-run')
var br = require('browserify')
var fs = require('fs')
var prettyTap = require('tap-spec')()

var conf = require('./config.json')
var db = level('../'+conf.host)
var safetyKill

var bundle = ''

var testCommands = ['+test','+test|bricoleur','+bricoleur|test']

db.put('#:tst', JSON.stringify(testCommands), function (e) { db.close() })

var phantom = run()
phantom.on('error', console.error)

function runBrowserTests () {
  var bunLoc = 'http://'+conf.host+':'+conf.port+'/bundle.js'
  var bun = require('request')(bunLoc)
  bun.on('error', function (e) { console.error(e) })
  bun.on('data', function (d) { bundle += d.toString() })
  bun.on('end', function startPhantom () {
    phantom.write(bundle)
    phantom.write(";window.onload=function(){window.location.hash='tst'};")
    phantom.end()
  })
}

phantom.pipe(prettyTap).pipe(process.stdout)

phantom.on('data', function (d) {
  if (!safetyKill) safetyKill = setTimeout(function () {
    phantom.stop()
    nimoy.kill()
  }, 60000)
  if (d.slice(0,4) ==='# ok' || d.slice(0,6) === '# fail') {
    nimoy.kill()
    phantom.stop()
    if (safetyKill) clearTimeout(safetyKill)
  }
})

var nimoy = spawn('node',['../boot','./tests/config.json'])

nimoy.stdout.on('data', function (d) {
  var chunk = d.toString().slice(0,5)
  if (chunk === 'wrote') runBrowserTests()
})

nimoy.stderr.on('data', function (e) {
  nimoy.kill()
  phantom.stop()
})

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true 
    : false

  return r
}
