var http = require('http')
var port = 80
var host = 'theblacksea.cc'

var server = http.createServer(function  (req,res) {
  if (req.method === 'POST' && req.headers.host === 'git.'+host) {
    console.log('post to git subdomain')
    var data = ''
    req.on('data', function (d) {
      data += d.toString()
    })
    req.on('end', function () {
      console.log(data)
      console.log(req.headers)
      res.end()
    })
  } else {
    res.statusCode = 404
    res.end('error 404')
  }
})
server.listen(port,host, function () {
  console.log('listening on port: '+port+' and host: '+host)
})
