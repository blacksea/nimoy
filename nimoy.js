var fs = require('fs')
var url = require('url')
var http = require('http')
var https = require('https')
var level = require('level')
var asyncMap = require('slide').asyncMap
var multilevel = require('multilevel')
var formidable = require('formidable')
var browserify = require('browserify')
var livestream = require('level-live-stream')
var engineServer = require('engine.io-stream')
var newhmac = require('crypto').createhmac


// RUN -- process  next tick or self calling function !?!
process.nextTick(function () {
  server.listen(config.port, config.host, function () {
    fs.watch(config.files.modules, compileModules)
    compileModules()
    console.log('server running on port: '+config.port+' host: '+config.host)
  })
})


// CONFIG -- if no dir then make one!
var config = (process.argv[2]) // also check db for config if no file found
  ? config = require(process.argv[2]) 
  : config = require('./config.json') 

if (config.files.modules.slice(-1) !== '/') config.files.modules += '/' 
if (config.files.static.slice(-1) !== '/') config.files.static += '/'

var db = level('./' + config.host)
livestream.install(db)
multilevel.writeManifest(db, './static/manifest.json')

var modes = {} // remove this

if (config.brico) { // handle configuration
  var conf = config.brico
  for (m in conf.modes) {
    if (conf.modes[m].pass) {
      var token = conf.modes[m].pass
      delete conf.modes[m].pass
      gethmac({token:token,user:m}, function (d) { modes[d.key] = d.val })
    }
  }
  db.put('config', JSON.stringify(conf))
}


// SERVER
fs.writeFileSync(config.files.static+'index.html', '<!doctype html>'+
'<html lang="en">'+
'<meta charset="utf-8">'+
'<head>'+
'<title>Untitiled</title>'+
'<link rel="stylesheet" href="/style.css">'+
'</head>'+
'<body id="canvas">'+
'<div class="container">'+
'</div>'+
'<script src="/bundle.js"></script>'+
'</body>'+
'</html>')

var fileserver = require('node-static').Server

if (!config.crypto) {
  var file = new fileserver(config.files.static)
  var server = http.createServer(handleHttp)
} else {
  var hsts = {'Strict-Transport-Security':'max-age=31536000'}
  var file = new fileServer(config.files.static, hsts)
  var server = https.createServer({
    honorCipherOrder : true,
    key : fs.readFileSync(config.crypto.key),
    cert : fs.readFileSync(config.crypto.cert),
    cipher : 'ecdh+aesgcm:dh+aesgcm:ecdh+aes256:dh+aes256:'+
             'ecdh+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:'+
             'RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS'
  }, handleHttp)
}

function handleHttp (req, res) {
  if (req.url === '/upload' && req.method === 'post') fileupload(req, res)
  file.serve(req, res, function noFile (e) {
    if (e) {
      var path = url.parse(req.url).pathname.slice(1)
      file.serveFile('/index.html', 200, {}, req, res)
      console.log(path)
    }
  })
}

var engine = engineServer(function (wss) {
  wss.pipe(multiLevel.server(db, {
    auth: function (user, cb) {
      getHmac({token:user.pass,user:user.user}, function handleHmac (d) {
        if (modes[user.user] === pass) cb(null, { name: user.user, token: d.val })
        if (modes[user.user] !== pass) cb(new Error('wrong pass!'), null)
        if (e) cb(e, null)
      })
    }, 
    access: function (user, db, method, args) {}
  })).pipe(wss)
  wss.on('error', console.error)
}, {cookie:false})
  .attach(server, '/ws')


// UTILS
function getHmac (d, cb) { 
  var hmac = newHmac(config.hmac.algo, config.hmac.key)
  hmac.setEncoding('hex')
  hmac.write(d.token)
  hmac.end()
  cb({key:'users:'+d.user, val:hmac.read().toString()})
}

function handleUpload (req, res) {
  var form = new formidable.IncomingForm()
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'})
    res.write('received upload:\n\n')
    res.end()
    var blob = fields.blob.split(',')[1]
    fs.writeFileSync(config.files.uploads+fields.file, blob, {encoding:'base64'})
  })
}

function compileModules (event, file) {// replace this ! -- steal old map fn
  var library  = {}
  var inBun = config.files.bundleIn
  var outBun = config.files.bundleOut
  var b = browserify(inBun)

  var modulesFolder = fs.readdirSync(config.files.modules)

  asyncMap(modulesFolder, function (moduleFolder, next) {
    var pkgPath = config.files.modules + moduleFolder + '/package.json'
    if (!fs.existsSync(pkgPath)) { next(); return null }
    var pkg = JSON.parse(fs.readFileSync(pkgPath, {encoding:'utf8'}))
    if (!pkg.nimoy) { next(); return null }
    var key = 'modules:'+pkg.name
    library[key] = pkg.nimoy
    b.require(config.files.modules+moduleFolder+'/'+pkg.main, {expose: moduleFolder})
    next()
    // add pkg to library
  }, function end () {
    db.put('library', JSON.stringify(library))
    var bun = fs.createWriteStream(config.files.bundleOut)
    bun.on('finish',function () {console.log('compiled '+inBun+' to '+outBun)})
    b.bundle().pipe(bun)
  })
}
