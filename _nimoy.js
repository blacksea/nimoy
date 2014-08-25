var fs = require('fs')
var url = require('url')
var http = require('http')
var https = require('https')
var level = require('level')
var _ = require('underscore')
var emitter = require('events').EventEmitter
var livestream = require('level-live-stream')
var engineServer = require('engine.io-stream')
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

// allow websock \ swap (engine.io or ws)
module.exports.boot = boot
module.exports.cli = through.obj(cli) // new brico then pipe into process
module.exports.compile = compile
module.exports.upload = fileUpload
module.exports.auth = auth

function cli (d, enc, n) {}

function auth (user, cb) { // client makes id
  if (!user.pass||!user.name) {cb(new Error('bad login!'), null);return false}
  if (!isCuid(user.pass)) {
    var sess = cuid()
    sessions[user.name].push(sess)
    cb(null, {key:'@'+user.name,value:sess})
  } else {
    if (_.find(sessions[user.name],function (s){return s===user.pass})) {
      cb(null, {key:'@:'+user.name,value:user.pass})
    } else cb(new Error('bad login!'), null)
  }
}

function boot (conf, cb) { 
  if (!fs.existsSync('./static')) fs.mkdir('./static')
  if (!fs.existsSync('./static/files')) fs.mkdir('./static/files')

  var h = hash('SHA256').update('nimoy').digest('hex')

  var db = level(__dirname+'/'+conf.host)
             .on('error', handleErr)

  livestream.install(db)

  multiLevel.writeManifest(db, './static/manifest.json')

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

  startServer(conf, db, function () {
    cb(server.close)
  })
}

function compile (conf, cb) {
  var IN = __dirname + '/_client.js'
  var OUT = conf.path_static+'/bundle.js'
  var b = browserify(IN)
  var library  = {} 

  var folders = fs.readdirSync(__dirname+'/node_modules')

  asyncMap(folders, function compileModule (dir, next) {
    var folder = __dirname +'/node_modules/'+dir

    if (dir[0]!=='.') {
      var pkg = (fs.existsSync(folder))
        ? JSON.parse(fs.readFileSync(folder+'/package.json',{encoding:'utf8'}))
        : null

      if (pkg.nimoy) {
        library[pkg.name] = pkg
        b.require(folder+'/'+pkg.main, {expose: pkg.name})
      }
    }
    next()
  }, function end () {
    fs.writeFileSync(__dirname+'/library.json', JSON.stringify(library))
    var bundleJS = fs.createWriteStream(OUT)
    b.transform('brfs')
    b.bundle().pipe(bundleJS)
    bundleJS.on('finish',function () {
      cb(null, library)
    })
  })
}

function startServer (conf, db, cb) {
  var mount = st({
    index: 'index.html', 
    path: conf.path_static,
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

function fileUpload (req, res) { // replace w. external!?
  var form = new formidable.IncomingForm()
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

function handleErr (e) { console.error(e) }

function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true : false
  return r
}
