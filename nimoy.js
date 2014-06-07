var fs = require('fs')
var url = require('url')
var http = require('http')
var https = require('https')
var level = require('level')
var asyncMap = require('slide').asyncMap
var multiLevel = require('multilevel')
var livestream = require('level-live-stream')
var browserify = require('browserify')
var engineServer = require('engine.io-stream')
var fileserver = require('node-static').Server
var newhmac = require('crypto').createhmac
var formidable = require('formidable')

!(process.argv[2]) 
  ? boot(require('./config.json'))
  : boot(process.argv[2])

function startServer (conf, cb) { // WRITE INDEX!
  fs.writeFileSync('./static/index.html', '<!doctype html>'+
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

  if (!conf.ssl) {
    var file = new fileserver('./static')
    var server = http.createServer(handleHttp)
  } else {
    var hsts = {'Strict-Transport-Security':'max-age=31536000'}
    var file = new fileServer('./static', hsts)
    var server = https.createServer({
      honorCipherOrder : true,
      key : fs.readFileSync(conf.ssl.key),
      cert : fs.readFileSync(conf.ssl.cert),
      cipher : 'ecdh+aesgcm:dh+aesgcm:ecdh+aes256:dh+aes256:'+
               'ecdh+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:'+
               'RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS'
    }, handleHttp)
  }

  function handleHttp (req, res) {
    if (req.url === '/upload' && req.method === 'post') fileUpload(req, res)
    file.serve(req, res, function noFile (e) {
      if (e) {
        var path = url.parse(req.url).pathname.slice(1)
        file.serveFile('/index.html', 200, {}, req, res)
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

  server.listen(conf.port, conf.host, cb)
}

function boot (conf) {
  if (!conf) throw new Error('Nimoy needs a config to run!')
  if (!fs.existsSync('./static')) fs.mkdir('./static')

  var db = level('./' + conf.host)
  livestream.install(db)
  multiLevel.writeManifest(db, './static/manifest.json')

  compileModules(conf.bundle, function (library) {
    db.put('library', JSON.stringify(library))
    startServer(conf.server)
  })

  if (conf.brico) {
    var conf = conf.brico
    for (m in conf.modes) {
      if (conf.modes[m].pass) {
        var token = conf.modes[m].pass
        delete conf.modes[m].pass
        gethmac({token:token,user:m}, function (d) { modes[d.key] = d.val })
      }
    }
    db.put('config', JSON.stringify(conf))
  }
}

function getHmac (algo, key, d, next) { 
  var hmac = newHmac(algo, key)
  hmac.setEncoding('hex')
  hmac.write(d.token)
  hmac.end()
  next({key:'users:'+d.user, val:hmac.read().toString()})
}

function compileModules (config, cb) {
  var library  = {}
  var inBun = config.pathBundleEntry
  var outBun = config.pathBundleOut
  var b = browserify(inBun)
  var modulesFolder = fs.readdirSync(config.pathModules)

  asyncMap(modulesFolder, function (moduleFolder, next) {
    var pkgPath = config.pathModules + moduleFolder + '/package.json'
    if (!fs.existsSync(pkgPath)) { next(); return null }

    var pkg = JSON.parse(fs.readFileSync(pkgPath, {encoding:'utf8'}))
    if (!pkg.nimoy) { next(); return null }

    var key = 'modules:'+pkg.name
    library[key] = pkg.nimoy
    b.require(config.pathModules+moduleFolder+'/'+pkg.main, {expose: moduleFolder})

    next()

  }, function end () {
    var bun = fs.createWriteStream(outBun)
    bun.on('finish',function () {console.log('compiled '+inBun+' to '+outBun)})
    b.bundle().pipe(bun)
    cb(library)
  })
}

function fileUpload (req, res) {
  var form = new formidable.IncomingForm()
  form.parse(req, function(err, fields, files) {
    // this may need changing!
    res.writeHead(200, {'content-type': 'text/plain'})
    res.write('received upload:\n\n')
    res.end()
    var blob = fields.blob.split(',')[1]
    fs.writeFileSync(config.files.uploads+fields.file, blob, {encoding:'base64'})
  })
}
