var http = require('http')
var port = 80
var host = 'theblacksea.cc'

var server = http.createServer (req,res) {
  if (req.method === 'post' && req.headers.host = 'git.'+host) {
    req.on('data', function (d) {
      console.log(d)
    })
    req.on('end', function () {
      console.log(req.headers)
    })
  } else {
    res.statusCode = 404
    res.end('error 404')
  }
}
server.listen(port,host, function () {
  console.log('listening on port: '+port+' and host: '+host)
})
