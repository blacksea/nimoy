var test = require('tape')
var spawn = require('child_process').spawn
var exec = require('child_process').exec
var brun = require('browser-run')
var br = require('browserify')
var fs = require('fs')

var btest = fs.readFileSync('./browser.js','utf8')

// ZOMG!

test('BOOT NIMOY', function (t) { // run boot command!
  var nimoy = spawn('node',['../boot','./tests/config.json'])
  var run = brun({browser:'phantom'})
  var bundle = ''

  // prepare a config to use when booting
  
  // bricoleur should not produce output
  
  // plug a test script in after bricoleur that just manipulates ui

  t.plan(3)

  t.on('end', function () {
    run.stop()
    nimoy.kill()
  })

  run.on('data', function (d) {
    console.log(d)
  })

  function runBrowser () {
    run.write(bundle)
    run.write(btest)
    run.end()
  }

  nimoy.stdout.on('data', function (d) {
    var md = d.toString().slice(0,3)
    if (md==='000') {
      t.ok(md,'server running')
    } else if (md==='200') {
      t.ok(md,'piping bundle')
    } else if (md==='X0X') {
      runBrowser()
    } else {
      bundle += d.toString()
    }
  })

  nimoy.stderr.on('data', function (e) { // fail if error!
    t.fail()
    console.error(e.toString())
    nimoy.kill()
    run.stop()
    t.end()
  })
})

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true 
    : false

  return r
}
