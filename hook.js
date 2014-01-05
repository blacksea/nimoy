var http = require('http')
var port = 80
var host = 'theblacksea.cc'

var server = http.createServer(function  (req,res) {
  if (req.method === 'POST') {
    if (req.headers.host === 'git.'+host) console.log('post to git subdomain')
    req.on('data', function (d) {
      console.log(d)
      console.log(d.toString())
    })
    req.on('end', function () {
      console.log(req.headers)
    })
  } else {
    res.statusCode = 404
    res.end('error 404')
  }
})
server.listen(port,host, function () {
  console.log('listening on port: '+port+' and host: '+host)
})
