// quickstart wrapper for nimoy!

// allow for ws or engine-io to handle sockets

var fs = require('fs')
var nimoy = require('./_nimoy')
var configFlag = process.argv[2] 
var exec = require('child_process').exec
var timeModified = ''

var conf = !(configFlag) 
  ? require('./config.json')
  : require(process.argv[2])

if (conf.watch) {
  fs.watch(__dirname+'/lib', libDirChange)
}

function libDirChange (e,f) {
  if (e==='change') {
    var ctime = fs.statSync(__dirname+'/lib/'+f).ctime.toString()
    if (timeModified !== ctime) {
      nimoy.compile(conf, writeLib)
      timeModified = ctime
    }
  }
}

function streamBundle (e,s) {
  process.stdout.write('200')
  process.nextTick(function () {
    s.pipe(process.stdout)
    s.on('end',function () {
      process.stdout.write('X0X')
      nimoy.boot(conf, function (kill) {
        process.stdout.write('000')
      })
    })
  })
}

nimoy.compile(conf, streamBundle)
