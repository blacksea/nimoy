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
var newHmac = require('crypto').createHmac
var formidable = require('formidable')

var users = {}
var configFlag = process.argv[2] // specify a config file when booting


!(configFlag) 
  ? boot(require('./config.json'))
  : boot(process.argv[2])

function startServer (conf, db, cb) { // just write the index... yeah...

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
      auth: function (user, cb) { // split to external fn
        getHmac({
          token:user.pass,
          user:user.user, 
          secret:conf.secretKey}
          , function handleHmac (d) {
            if (users[user.user] === pass) cb(null, { name: user.user, token: d.val })
            if (users[user.user] !== pass) cb(new Error('wrong pass!'), null)
            if (e) cb(e, null)
        })
      }, 
      access: function (user, db, method, args) {} //split out
    })).pipe(wss)
    wss.on('error', console.error)
  }, {cookie:false})
    .attach(server, '/ws')

  server.listen(conf.port, conf.host, cb)
}

function boot (conf) {
  process.stdin.on('data', function (buf) {
    var str = buf.toString()
    if (str === 'c\n') compileModules(conf.bundle, console.log)
  })

  if (!conf || !conf.server || !conf.bricoleur || !conf.bundle) {
    throw new Error('nimoy: invalid or missing config.json')
  }

  if (!fs.existsSync('./static')) fs.mkdir('./static')

  var db = level('./' + conf.host)
  livestream.install(db)
  multiLevel.writeManifest(db, './static/manifest.json')

  conf.server.secretKey = conf.bricoleur.secretKey

  compileModules(conf.bundle, function (library) {
    db.put('library', JSON.stringify(library))
    startServer(conf.server, db, function () {
      console.log('server running')
    })
  })

  var bricoConf = conf.bricoleur
  for (user in bricoConf.users) {
    var u = bricoConf.users[user]
    if (!u.pass) return false
    getHmac({token:u.pass,user:user,secret:bricoConf.secretKey}, function (d) {
      users[d.key] = d.val 
      delete u.pass
    })
  }

  delete bricoConf.secretKey
  db.put('config', JSON.stringify(bricoConf))
}

function getHmac (d, cb) { 
  var hmac = newHmac('sha256', d.secret)
  hmac.setEncoding('hex')
  hmac.write(d.token)
  hmac.end()
  cb({key:'users:'+d.user, val:hmac.read().toString()})
}

function compileModules (config, cb) {
  var library  = {}
  var inBun = config.pathBundleEntry
  var outBun = config.pathBundleOut
  var b = browserify(inBun)
  var modulesFolder = fs.readdirSync(config.pathModules)

  asyncMap(modulesFolder, function (moduleFolder, next) {
    var pkgPath = config.pathModules + moduleFolder + '/package.json'
    var templatePath = config.pathModules + moduleFolder+'/'+moduleFolder+'.hogan'

    if (!fs.existsSync(pkgPath)) { next(); return null }

    var pkg = JSON.parse(fs.readFileSync(pkgPath, {encoding:'utf8'}))
    if (!pkg.nimoy) { next(); return null }

    if (fs.existsSync(templatePath)) 
      pkg.html = fs.readFileSync(templatePath, {encoding:'utf8'})

    var key = 'modules:'+pkg.name
    library[key] = pkg
    b.require(config.pathModules+moduleFolder+'/'+pkg.main, {
      expose: moduleFolder
    })

    next()
  }, function end () {
    var bun = fs.createWriteStream(outBun)
    b.bundle().pipe(bun)
    bun.on('finish',function () {
      console.log('compiled '+inBun+' to '+outBun)
      cb(library)
    })
  })
}

function fileUpload (req, res) {
  var form = new formidable.IncomingForm()
  form.parse(req, function(err, fields, files) {
    var filePath = './static/uploads/'+fields.file
    res.writeHead(200, {'content-type': 'text/plain'})
    res.write('received upload:\n\n')
    res.end()
    var blob = fields.blob.split(',')[1]
    fs.writeFileSync(filePath, blob, {encoding:'base64'}) // encoding !?
  })
}
