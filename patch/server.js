var st = require('st')
var http = require('http')
var fs = require('fs')
var exec = require('child_process').exec

var mount = st({index:'index.html', path:__dirname, cache:false})

http.createServer(function (req,res) {
  mount(req,res)
}).listen(8888)

var cssMod = null
fs.watch('./boot.js',function (e,f) {
  if (e === 'change') {
    var ctime = fs.statSync('./boot.js').ctime.toString()
    if (cssMod !== ctime) {
      exec('notify-send "BUNDLED"',function (e,s,es) {})
      exec('browserify boot.js -o bundle.js',function (e,s,es) {
        console.log(e)
        console.log(s)
        console.log(es)
      })
      cssMod = ctime
    }
  }
})
