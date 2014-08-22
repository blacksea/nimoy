var fs = require('fs')
var url = require('url')
var http = require('http')
var https = require('https')
var level = require('level')
var emitter = require('events').EventEmitter
var multiLevel = require('multilevel')
var browserify = require('browserify')
var livestream = require('level-live-stream')
var engineServer = require('engine.io-stream')
var newHmac = require('crypto').createHmac
var asyncMap = require('slide').asyncMap
var formidable = require('formidable')
var uglify = require('uglify-js')
var through = require('through2')
var path = require('path')
var st = require('st')

var SESSION_EXPIRE = 36000
var sessions = {}
var users = {}

// allow websock swap (engine.io or ws)

module.exports = function Nimoy (conf) {
  if (conf.server.sessionLength) SESSION_EXPIRE = conf.sessionLength
  var nimoy = new emitter()
  nimoy.compile = function () {
    compile(conf.bundle, function (e, res) {
      if (e) { handleErr(e); return null }
      nimoy.emit('compiled', res)
    })
    return nimoy
  }
  nimoy.boot = function () {
    boot(conf, function () {
      nimoy.emit('boot')
    })
    return nimoy
  } 
  nimoy.kill = function () {
    server.close()
  }
  return nimoy
}

function auth (user, cb) { // client makes id
  if (sessions[user.id]) {
    if (getTime() < sessions[user.id]+SESSION_EXPIRE) {
      cb(null, {status:1})
    } else cb(new Error('Expired session!'), null)
    return false
  }
  if (user.pass && user.pass === users[user.name]) {
    sessions[user.id] = getTime()
    cb(null,{status:1})
  } else cb(new Error('Bad Login'), null)
}

function boot (conf, cb) { 
  if (!fs.existsSync('./static')) fs.mkdir('./static')
  if (!fs.existsSync('./static/files')) fs.mkdir('./static/files')

  var db = level('./' + conf.server.host)
  db.on('error', handleErr)
  livestream.install(db)
  multiLevel.writeManifest(db, './static/manifest.json')

  conf.server.secretKey = conf.bricoleur.secretKey

  // write index
  fs.writeFileSync('./static/index.html', 
    '<!doctype html>' +
    '<html lang="en">' +
    '<meta charset="utf-8">' +
    '<head>' +
    '<title></title>' +
    '<link rel="stylesheet" href="/style.css">' +
    '</head>' +
    '<body id="canvas">' +
    '<script src="/bundle.js"></script>' +
    '</body>' +
    '</html>'
  )

  getHmac({
    token: conf.bricoleur.pass,
    user: 'edit',
    secret: conf.bricoleur.secretKey.toString()
  }, function (d) {
    users.edit = d.val
  })

  startServer(conf.server, db, cb)
}


function compile (config, cb) {
  var IN = config.pathBundleEntry
  var OUT = config.pathBundleOut
  var b = browserify(IN)
  var library  = {} 
  var modulesDir = fs.readdirSync(config.pathModules)
  if (!modulesDir) {cb(err('missing modules dir!'), null); return false}

  asyncMap(modulesDir, function compileModule (dirname, next) {
    dirname = config.pathModules+dirname+'/'
    var pkgPath = dirname+'package.json'
    if (!fs.existsSync(pkgPath)) { next(); return false }
    var pkg = JSON.parse(fs.readFileSync(pkgPath, {encoding:'utf8'}))
    if (!pkg || !pkg.nimoy) { next(); return false }

    library[pkg.name] = pkg

    b.require(dirname+pkg.main, {
      expose: pkg.name
    })
    next()
  }, function end () {
    var bundleJS = fs.createWriteStream(OUT)
    b.transform('brfs')
    b.bundle().pipe(bundleJS)
    bundleJS.on('finish',function () {
      fs.writeFileSync('./library.json', JSON.stringify(library))
      cb(null, library)
    })
  })
}


function startServer (conf, db, cb) {
  var mount = st({
    index: 'index.html', 
    path: './static', 
    url: '/', 
    passthrough: true 
  })

  if (!conf.ssl) {
    server = http.createServer(handleHttp)
  } else {
    server = https.createServer({
      honorCipherOrder : true,
      key : fs.readFileSync(conf.ssl.key),
      cert : fs.readFileSync(conf.ssl.cert),
      cipher : 'ecdh+aesgcm:dh+aesgcm:ecdh+aes256:dh+aes256:' +
               'ecdh+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:' +
               'RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS'
    }, handleHttp)
  }

  function handleHttp (req, res) {
    res.setHeader('X-Frame-Options', 'Deny')
    if (conf.ssl) 
      res.setHeader('Strict-Transport-Security','max-age=31536000')
    if (req.url === '/upload' && req.method === 'POST') {
      fileUpload(req, res)
    } else {
      mount(req, res, function err () {
        res.end('<html><script type="text/javascript">' +
                'window.location.pathname = "/";</script></html>')
      })
    }
  }

  function fileUpload (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var filePath = './static/files/'+fields.file
      var blob = fields.blob.split(',')[1]
      res.writeHead(200, {'content-type': 'text/plain'})
      res.write('received upload:\n\n')
      res.end()
      fs.writeFile(filePath, blob, {encoding:'base64'}, function (e) {
        if (!e) db.put('file:'+fields.id, '/files/'+fields.file)
      }) 
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


function getHmac (d, cb) { 
  var hmac = newHmac('sha256', d.secret)
  hmac.setEncoding('hex')
  hmac.write(d.token)
  hmac.end()
  cb({key:d.user, val:hmac.read().toString()})
}

function getTime() { return new Date().getTime() }

function handleErr (e) {
  console.error(e)
}
