var fs = require('fs')
var url = require('url')
var http = require('http')
var https = require('https')
var level = require('level')
var _ = require('underscore')
var emitter = require('events').EventEmitter
var livestream = require('level-live-stream')
var engineServer = require('engine.io-stream')
var websocServer = require('ws').Server
var wsStream = require('websocket-stream')
var asyncMap = require('slide').asyncMap
var hash = require('crypto').createHash
var multiLevel = require('multilevel')
var browserify = require('browserify')
var formidable = require('formidable')
var uglify = require('uglify-js')
var through = require('through2')
var path = require('path')
var cuid = require('cuid')
var st = require('st')

var sessions = {edit:[]}
var users = {}
var pass

module.exports.boot = boot
module.exports.compile = compile

var db
var pass

var INDEX = '<!doctype html>' +
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

function cli (d, enc, n) {}

function auth (user, cb) { // client makes id
  var res = {}
  if (user.parcel) res.parcel = user.parcel
  if (!user.pass||!user.name) {
    var e = new Error('bad login!')
    e.code = 1
    cb(e, null)
    return false
  }
  if (!isCuid(user.pass) && user.pass===pass) { // verify pass!
    var sess = cuid()
    sessions[user.name].push(sess)
    res.key = '@'+user.name
    res.value = sess
    cb(null, res)
  } else if (_.find(sessions[user.name],function (s){return s===user.pass})) {
    res.key = '@'+user.name
    res.value = user.pass
    cb(null, res)
  } else { 
    var e
    if (!isCuid(user.pass)) e = new Error('Wrong password!')
    else e = new Error('Expired session')
    e.code = 1
    cb(e, null)
  }
}

function boot (conf, cb) { 
  pass = hash('sha256').update(conf.pass).digest('hex')
  
  if (!fs.existsSync(__dirname+'/static')) 
    fs.mkdirSync(__dirname+'/static')

  if (!fs.existsSync(__dirname+'/static/files'))
    fs.mkdirSync(__dirname+'/static/files')

  db = level(__dirname+'/'+conf.host)
             .on('error', handleErrs)
  livestream.install(db)
  multiLevel.writeManifest(db, __dirname+'/static/manifest.json')

  var h = hash('SHA256').update('nimoy').digest('hex')

  // write index

  fs.writeFileSync(__dirname+'/static/index.html', INDEX)

  startServer(conf, db, function () {
    cb(server.close)
  })
}

function compile (conf, cb) {
  var IN = __dirname + '/_client.js'
  var OUT = __dirname + '/'+conf.path_static+'/bundle.js'
  var MODULES = __dirname + '/' + conf.path_modules
  var b = browserify(IN)
  var library  = {} 

  var folders = fs.readdirSync(MODULES)

  // also compile the core lib
  asyncMap(folders, function compileModule (dir, next) {
    var folder = __dirname +'/'+conf.path_modules+dir
    if (!fs.statSync(folder).isDirectory()) {next();return false}
    if (dir[0]!=='.') {
      var pkg = (fs.existsSync(folder))
        ? JSON.parse(fs.readFileSync(folder+'/package.json',{encoding:'utf8'}))
        : null

      if (pkg && pkg.nimoy) {
        library[pkg.name] = pkg
        b.require(folder+'/'+pkg.main, {expose: pkg.name})
      }
    }
    next()
  }, function end () {
    library.env = {port: conf.port, host: conf.host}  
    fs.writeFileSync(__dirname+'/library.json', JSON.stringify(library))
    var bundleJS = fs.createWriteStream(OUT)
    b.transform('brfs')
    b.bundle().pipe(bundleJS)
    bundleJS.on('finish', function () {
      if (conf.minify) fs.writeFileSync(OUT,uglify.minify(OUT).code)
      cb()
    })
  })
}

function startServer (conf, db, cb) {
  var stOpts = {
    index: 'index.html', 
    path: __dirname+'/'+conf.path_static,
    url: '/', 
    passthrough: true 
  }

  if (conf.dev) stOpts.cache = false

  var mount = st(stOpts)

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
        res.end(INDEX)
      })
    }
  }
  
  function handleSoc (soc) {
    soc.pipe(multiLevel.server(db, {
    auth: auth,
    access: function access (user, db, method, args) {
      if (!user) return false
      var name = user.key.slice(1)
      if (!_.values(sessions[name],function (v) {return v===user.value})) {
        if (/^put|^del|^batch|write/i.test(method)) { // no write access!
          throw new Error('read-only access');
        }
      }
    }})).pipe(soc)
    soc.on('error', console.error)
  }

  server.listen(conf.port, conf.host, cb)

  if (conf.soc==='engine') { 
    engineServer(handleSoc, {cookie:false})
      .attach(server, '/ws')
  } else if (conf.soc==='ws' || !conf.soc) {
    var wss = new websocServer({server:server})
    wss.on('connection', function (soc) {
      var s = wsStream(soc)
      handleSoc(s)
    })
  }
} 

function fileUpload (req, res) { // replace w. external!?
  var form = new formidable.IncomingForm()
  form.parse(req, function(err, fields, files) {
    var filePath = __dirname+'/static/files/'+fields.file
    var blob = fields.blob.split(',')[1]
    res.writeHead(200, {'content-type': 'text/plain'})
    res.write('received upload:\n\n')
    res.end()
    fs.writeFile(filePath, blob, {encoding:'base64'}, function (e) {
      if (!e) db.put('file:'+fields.id, '/files/'+fields.file)
    }) 
  })
}

function handleErrs (e) { console.error(e) }

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true : false

  return r
}
