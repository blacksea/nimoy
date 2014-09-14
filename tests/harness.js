var test = require('tape')
var spawn = require('child_process').spawn
var exec = require('child_process').exec
var request = require('request')
var run = require('browser-run')
var br = require('browserify')
var level = require('level')
var fs = require('fs')


var conf = require('./config.json')
var db = level('../'+conf.host)

var testCommands = ['+test','+test|bricoleur','+bricoleur|test']

db.put('#:tst', JSON.stringify(testCommands), function (e) {
  db.close()
  test('BOOT NIMOY', runner) // load in a seperate specific test
})

function runner (t) { 
  var nimoy = spawn('node',['../boot','./tests/config.json'])
  // var phantom = run()
  var bundle = ''

  t.plan(2)

  t.on('end', function () {
    // phantom.stop()
    nimoy.kill()
  })

  // phantom.on('data', function (d) { // output to test!
  //   console.log(d)
  // })

  function runBrowser () {
    phantom.write(bundle)
    phantom.write(";window.addEventListener('load',"
      + "function(){window.location.hash='tst'},false);")
    phantom.end()
  }

  // instead of piping from compile just send a req to server and pipe!

  nimoy.stdout.on('data', function (d) {
    var md = d.toString().slice(0,3)
    if (md === '000') {
      t.ok(md,'server running')
    } else if (md === '200') {
      t.ok(md,'piping bundle')
      // var bunLoc = 'http://'+conf.host+':'+conf.port+'/bundle.js'
      // var bun = require('request')(bunLoc)
      // bun.on('data', function (d) {
      //   bundle += d
      // })
      // bun.on('end', runBrowser)
    }
  })

  nimoy.stderr.on('data', function (e) {
    console.error(e.toString())
    nimoy.kill()
    // phantom.stop()
    t.end()
  })
}

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true 
    : false

  return r
}
