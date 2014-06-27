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

var Sessions = function (users) { 
  var self = this
  this._ = {}

  this.auth = function (user, cb) { 
    var auth = false

    if (user.pass && user.pass === users[user.name]) 
      auth = true

    if (user.session && self._[user.name] && self._[user.name] == user.session)      auth = true

    if (auth === true) {
      var sessionID = Math.random().toString().slice(2) 
      if (!self._[user.name]) self._[user.name] = sessionID
      cb(null, { name: user.name, token: self._[user.name], time: getTime() })
    }
    if (auth === false) cb(new Error('Bad Login'), null) // use codes instead
  }
}

var configFlag = process.argv[2] 

!(configFlag) 
  ? boot(require('./config.json'))
  : boot(process.argv[2])

function boot (conf) {
  var rootModules = [conf.bricoleur.canvasRender, conf.bricoleur.auth]

  process.stdin.on('data', function (buf) { 
    var str = buf.toString()

    if (str === 'c\n') 
      compileModules(conf.server.bundle, rootModules, console.log)
  })

  if (!conf || !conf.server || !conf.bricoleur)
    throw new Error('nimoy: invalid or missing config.json')
  
  if (!fs.existsSync('./static')) fs.mkdir('./static')

  var db = level('./' + conf.server.host)
  livestream.install(db)
  multiLevel.writeManifest(db, './static/manifest.json')

  conf.server.secretKey = conf.bricoleur.secretKey

  var bricoConf = conf.bricoleur

  var users = {}

  for (user in bricoConf.users) {
    var u = bricoConf.users[user]
    if (u.canvas) {
      rootModules = rootModules.concat(u.canvas.modules)
    }
    if (u.pass) getHmac({
      token: u.pass,
      user: user,
      secret: bricoConf.secretKey.toString()
    }, function (d) {
      delete bricoConf.users[user].pass
      users[user] = d.val // delete u.pass
    })
  }

  var handleSessions = new Sessions(users).auth

  compileModules(conf.server.bundle, rootModules, function (library) {
    bricoConf.library = library
    bricoConf.uImg = new Buffer(conf.bricoleur.secretKey)
    delete bricoConf.secretKey

    fs.writeFileSync('./bricoleurConfig.json', JSON.stringify(bricoConf))

    startServer(conf.server, db, handleSessions, function () { 
      console.log('server running') 
    })
  })
}

function compileModules (config, rootModules, cb) {
  var library  = {
    master: {},
    root: {},
    global: {}
  } 
  
  var inBun = config.pathBundleEntry
  var outBun = config.pathBundleOut
  var b = browserify(inBun)
  var modulesFolder = fs.readdirSync(config.pathModules)

  asyncMap(modulesFolder, function compileModule (moduleFolder, next) {
    var pkgPath = config.pathModules + moduleFolder + '/package.json'

    var templatePath = config.pathModules + moduleFolder + '/' + moduleFolder
                       + '.hogan'

    if (!fs.existsSync(pkgPath)) { next(); return false }

    var pkg = JSON.parse(fs.readFileSync(pkgPath, {encoding:'utf8'}))

    if (!pkg.nimoy) { next(); return false }

    if (fs.existsSync(templatePath)) 
      pkg.html = fs.readFileSync(templatePath, {encoding:'utf8'})

    var key = 'modules:'+pkg.name
    var root = false 

    for (var i=0; i < rootModules.length; i++) {
      var m = rootModules[i]
      if (m === pkg.name) root = true
    }

    (root) ? library.root[key] = pkg : library.global[key] = pkg;
    library.master[key] = pkg

    b.require(config.pathModules+moduleFolder+'/'+pkg.main, {
      expose: moduleFolder
    })

    next()

  }, function end () {

    cb(library)

    var bun = fs.createWriteStream(outBun)

    b.bundle().pipe(bun)

    bun.on('finish',function () {
      console.log('compiled '+inBun+' to '+outBun)
    })
  })
}

function startServer (conf, db, auth, cb) { 

  fs.writeFileSync('./static/index.html', '<!doctype html>' +
  '<html lang="en">' +
  '<meta charset="utf-8">' +
  '<head>' +
  '<title>Untitiled</title>' +
  '<link rel="stylesheet" href="/style.css">' +
  '</head>' +
  '<body id="canvas">' +
  '<div class="container">' +
  '</div>' +
  '<script src="/bundle.js"></script>' +
  '</body>' +
  '</html>')

  if (!conf.ssl) {
    var file = new fileserver('./static', {'X-Frame-Options' : 'Deny'})
    var server = http.createServer(handleHttp)
  } else {
    var file = new fileServer('./static', {
      'X-Frame-Options' : 'Deny' ,
      'Strict-Transport-Security':'max-age=31536000'
    })
    var server = https.createServer({
      honorCipherOrder : true,
      key : fs.readFileSync(conf.ssl.key),
      cert : fs.readFileSync(conf.ssl.cert),
      cipher : 'ecdh+aesgcm:dh+aesgcm:ecdh+aes256:dh+aes256:' +
               'ecdh+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:' +
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
    wss.on('error', console.error)
    wss.pipe(multiLevel.server(db, {
      auth: auth,
      access: function access (user, db, method, args) {
        if (!user || user.name !== 'edit') {
          if (/^put|^del|^batch|write/i.test(method)) { // no write access!
            throw new Error('read-only access');
          }
        }
      }
    })).pipe(wss)
  }, {cookie:false})
    .attach(server, '/ws')

  server.listen(conf.port, conf.host, cb)
}

function fileUpload (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var filePath = './static/uploads/'+fields.file

    res.writeHead(200, {'content-type': 'text/plain'})
    res.write('received upload:\n\n')
    res.end()

    var blob = fields.blob.split(',')[1]

    fs.writeFileSync(filePath, blob, {encoding:'base64'}) 
  })
}

function getHmac (d, cb) { 
  var hmac = newHmac('sha256', d.secret)
  hmac.setEncoding('hex')
  hmac.write(d.token)
  hmac.end()
  cb({key:d.user, val:hmac.read().toString()})
}

function getTime() { return new Date().getTime() }
