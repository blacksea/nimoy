var fs = require('fs')
var nimoy = require('./_nimoy')
var configFlag = process.argv[2] 
var exec = require('child_process').exec
var timeModified = ''

var conf = !(configFlag) 
  ? require('./config.json')
  : require(process.argv[2])

if (conf.watch) fs.watch(__dirname+'/lib', libDirChange)

function libDirChange (e,f) {
  if (e === 'change') {
    var ctime = fs.statSync(__dirname+'/lib/'+f).ctime.toString()
    if (timeModified !== ctime) {
      nimoy.compile(conf, streamBundle)
      timeModified = ctime
    }
  }
}

nimoy.boot(conf, function (kill) {
  process.stdout.write('000')
  nimoy.compile(conf, function () {
    process.stdout.write('200')
  })
})
