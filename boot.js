// quickstart wrapper for nimoy!

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

function writeLib (lib) {
  fs.writeFileSync(conf.path_static+'/library.json')
  console.log('wrote lib to '+conf.path_static+'/library.json')
  exec('notify-send "NIMOY : compiled library!"',function(e,s,se){})
}

nimoy.compile(conf, writeLib)

nimoy.boot(conf, function (kill) {
  console.log('Nimoy running on p: '+conf.port+' h: '+conf.host)
})

