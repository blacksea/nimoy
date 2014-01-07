// NIMOY 

// deps
var http = require('http')
var https = require('https')
var gzip = require('zlib').createGzip
var wsserver = require('ws').Server
var wsstream = require('websocket-stream')
var argv = require('optimist').argv
var fs = require('fs')

// handle config
var config = JSON.parse(fs.readFileSync('./config.json'))
if (!config) { config = {port : 8000,host : localhost,encrypt : false,dirStatic : './_static/',dirWilds : './_wilds/'} } 

if (argv) { // allow commandline args to override config
  for (arg in argv) {
    if (config[arg]) config[arg] = argv[arg]
  }
}

function fileServer (opts, up) {
  var server
  var static = opts.dir_static

  var index = '<html><head><title></title></head><body>'
  +'<script src="'+opts.bundle+'"></script>'
  +'</body></html>'

  if (opts.dir_static[opts.dir_static.length-1] !== '/') opts.dir_static += '/'

  if (opts.encrypt === true) {
    var certs = {key: fs.readFileSync('key.pem'),cert: fs.readFileSync('cert.pem')}
    server = https.createServer(certs, HandleReqs)
  } else {
    server = http.createServer(HandleReqs)
  }

  function HandleReqs (req, res) {
    // option for subdomains?
    if (req.headers.host === 'app.'+host) { // manage subdomains
      if (req.url === '/') {
        res.setHeader('Content-Type', 'text/html')
        res.end(HTML)
      } else if (req.url !== '/') {
        var file = fs.createReadStream('./static/'+req.url.replace('/',''))
        file.on('error', function(e) {
          console.error(e)
          res.statusCode = 404
          res.end()
        })
        res.setHeader('Content-Encoding', 'gzip')
        file.pipe(zlib.createGzip()).pipe(res)
      }
    }
  }

  server.listen(opts.port, opts.host, up)
}

function wsServer (opts)  {
  var socs = []
  var ws = new wsserver({port:wsport})
  ws.on('connection', function (soc) {
    var wss = wsstream(soc)
    var headers = soc.upgradeReq.headers
    if (headers.origin === 'https;//app.basilranch.com') {
      if (headers['sec-websocket-key']) var key = headers['sec-websocket-key']
      if (!headers['sec-websocket-key']) var key = headers['sec-websocket-key1'].replace(' ','_')
      wss.ident = key //!this is probly not secure?
      socs.push(wss)
      wss.on('close', function () {
        for(var i = 0;i<socs.length;i++) {
          if (socs[i].ident == key) socs.splice(i,1); break;
        }
      })
    }
  })
}

function REPL (msg) {
  var clc = require('cli-color')
  var read = require('read')

  var colors = [{f:0,b:11},{f:0,b:14},{f:0,b:15}]
  var clr = colors[Math.floor(Math.random() * ((colors.length-1) - 0 + 1) + 0)]

  if (msg) console.log(clc.xterm(clr.b)(msg))

  read({}, function handleInput (e,c,d) {
    if (e) console.error(e)
    if (!e) {
      var args = c.match(' ')
      if (args !== null) { 
        c = c.split(' ')
        s.write(c)
        REPL()
      } else {
        s.write(c)
        REPL()
      }
    }
  })

  var s = through(function write (d) {
    this.emit('data',d) 
  }, function end () {
    this.emit('end')
  })

  return s
}
