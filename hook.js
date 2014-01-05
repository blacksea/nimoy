var http = require('http')
var exec = require('child_process').exec
var port = 80
var host = 'theblacksea.cc'

var server = http.createServer(function  (req,res) {
  if (req.method === 'POST' && req.headers.host === 'git.'+host) {
    console.log('post to git subdomain')
    exec('git pull', function (e, stdout, stderr) {
      if (e) console.error(e)
      if (!e) console.log(stdout) 
    })
    var data = ''
    req.on('data', function (d) {
      data += d.toString()
    })
    req.on('end', function () {
      console.log(data)
      res.end()
    })
  } else {
    res.statusCode = 404
    res.end('error 404')
  }
})
server.listen(port,host, function () {
  console.log('Old User ID: ' + process.getuid() + ', Old Group ID: ' + process.getgid());
  process.setgid('users');
  process.setuid('agasca');
  console.log('new User ID: ' + process.getuid() + ', new Group ID: ' + process.getgid());
  console.log('listening on port: '+port+' and host: '+host)
})
