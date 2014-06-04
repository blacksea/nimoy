var fs = require('fs')
var url = require('url')
var http = require('http')
var level = require('level')
var multilevel = require('multilevel')
var formidable = require('formidable')
var browserify = require('browserify')
var livestream = require('level-live-stream')
var engineServer = require('engine.io-stream')

var newhmac = require('crypto').createhmac
var key = 'italocalvino'
var algo = 'sha256'
var modes = {}

var config = (process.argv[2]) // also check db for config if no file found
  ? config = require(process.argv[2]) 
  : config = require('./config.json') 

if (config.files.modules.slice(-1) !== '/') config.files.modules += '/' 
if (config.files.static.slice(-1) !== '/') config.files.static += '/'

var db = level('./' + config.host)
livestream.install(db)
multilevel.writeManifest(db, './static/manifest.json')

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

var index = '<!doctype html>'
          + '<html lang="en">'
          + '<meta charset="utf-8">'
          + '<head>'
          + '<title>Untitiled</title>'
          + '<link rel="stylesheet" href="/style.css">'
          + '</head>'
          + '<body id="canvas">'
          + '<div class="container">'
          + '</div>'
          + '<script src="/bundle.js"></script>'
          + '</body>'
          + '</html>'

fs.writeFileSync(config.files.static+'index.html', index)

var tlsConfig = {
  key : fs.readFileSync(config.crypto.key),
  cert : fs.readFileSync(config.crypto.cert),
  honorCipherOrder : true,
  cipher : 'ecdh+aesgcm:dh+aesgcm:ecdh+aes256:dh+aes256:'+
           'ecdh+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:'+
           'RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS'
}

var fileserver = require('node-static').Server

if (!config.crypto) {
  var server = http.createServer(handleHttp)
  var file = new fileserver(config.files.static)
} else {
  var server = http.createServer(tlsConfig, handleHttp)
  var file = new fileServer(config.files.static, {
    'Strict-Transport-Security','max-age=31536000'
  })
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

function getHmac (d, cb) { 
  var hmac = newHmac(ALGO, KEY)
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

function compileModules (event, file) {// replace this !
  var inBun = config.files.bundleIn
  var outBun = config.files.bundleOut

  fs.readdir(config.files.modules, function (e, files) {
    var components = {}
    var b = browserify(inBun)

    files.forEach(function (f) {
      var name = f.split('.')[0]
      var ext = f.split('.')[1]
      if (!components[name]) components[name] = {}
      var buf = fs.readFileSync(config.files.modules+f).toString()
      switch (ext) {
        case 'json' : components[name].pkg = JSON.parse(buf); break;
        case 'hogan' : components[name].html = buf; break;
        case 'js' : b.require(config.files.modules+f, {expose: name}); break;
      }
    })

    db.put('library', JSON.stringify(components))

    var bun = fs.createWriteStream(config.files.bundleOut)
    bun.on('finish',function () {console.log('compiled '+inBun+' to '+outBun)})
    b.bundle().pipe(bun)
  })
}

fs.watch(config.files.modules, compileModules)
compileModules()
