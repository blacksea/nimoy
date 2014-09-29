var fs = require('fs')
var nimoy = require('./_nimoy')
var configFlag = process.argv[2] 
var exec = require('child_process').exec
var timeModified = ''
var cssMod = ''

var conf = !(configFlag) 
  ? require('./config.json')
  : require(process.argv[2])

if (conf.watch) {
  fs.watch(__dirname+'/lib', libDirChange)
  fs.watch(__dirname+'/static/style.styl', compileCSS)
}

function compileCSS (e,f) {
  if (e === 'change') {
    var ctime = fs.statSync(__dirname+'/static/style.styl').ctime.toString()
    if (cssMod !== ctime) {
      exec('notify-send "NIMOY: CSS COMPILED!"',function (e,s,es) {})
      exec('stylus static/style.styl',function (e,s,es) {})
      cssMod = ctime
    }
  }

}

function libDirChange (e,f) {
  if (e === 'change') {
    var ctime = fs.statSync(__dirname+'/lib/'+f).ctime.toString()
    if (timeModified !== ctime) {
      nimoy.compile(conf, function () {
        exec('notify-send "NIMOY: LIB COMPILED!"',function (e,s,es) {})

        process.stdout.write('wrote bundle to '
                             + __dirname+'/'+conf.path_static
                             + '/bundle.js'
                             +'\n')
      })
      timeModified = ctime
    }
  }
}

nimoy.boot(conf, function (kill) {
  process.stdout.write('up on port '+conf.port+' & host '+conf.host+'\n')
  nimoy.compile(conf, function () {
    process.stdout.write('wrote bundle to '+__dirname+'/'+conf.path_static+'/bundle.js'+'\n')
  })
})
