var fs = require('fs')
var url = require('url')
var http = require('http')
var level = require('level')
var stache = require('templayed')
var config = require('./config.json')
var multilevel = require('multilevel')
var formidable = require('formidable')
var browserify = require('browserify')
var livestream = require('level-live-stream')
var engineserver = require('engine.io-stream')

var newhmac = require('crypto').createhmac
var key = 'italocalvino'
var algo = 'sha256'
var modes = {}

var index = './static/index.html'
fs.watchfile(config.components+'index.hogan', makeindex)

var db = level('./data')
livestream.install(db)
multilevel.writemanifest(db, './static/manifest.json')

var update = db.livestream()

var config = (process.argv[2]) 
  ? config = require(process.argv[2]) 
  : config = require('./config.json') 

if (config.modules.slice(-1) !== '/') config.modules += '/' 
if (config.static.slice(-1) !== '/') config.static += '/'

// configuration
if (config.brico) {
  var conf = config.brico
  for (m in conf.modes) {
    if (conf.modes[m].pass) {
      var token = conf.modes[m].pass
      delete conf.modes[m].pass
      gethmac({token:token,user:m}, function (d) { modes[d.key] = d.val })
    }
  }
  db.put('config', json.stringify(conf))
}

// server!
var fileserver = require('node-static').server
var file = new fileserver('./static')

var server = http.createserver(function (req, res) {
  if (req.url === '/upload' && req.method === 'post') fileupload(req, res)

  file.serve(req, res, function noFile (e) {
    if (e) {
      var path = url.parse(req.url).pathname.slice(1)
      file.serveFile('/index.html', 200, {}, req, res)
      console.log(path)
    }
  })
})
    
var engine = engineServer(function (wss) {
  wss.pipe(multiLevel.server(db, {auth: Auth, access: Access})).pipe(wss)
  wss.on('error', console.error)
}, {cookie:false})

engine.attach(server, '/ws')

server.listen(config.port, config.host, function () {
  console.log('server running on port: '+config.port+' host: '+config.host)
})

if (config.crypto) {

  var tlsConfig = {
    key : fs.readFileSync(config.crypto.key),
    cert : fs.readFileSync(config.crypto.cert),
    honorCipherOrder : true,
    cipher : 'ecdh+aesgcm:dh+aesgcm:ecdh+aes256:dh+aes256:'+
             'ecdh+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:'+
             'RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS'
  }

  if (config.crypto.ca) tlsConfig.ca = fs.readFileSync(config.crypto.ca)

  var file = fileServer.Server(config.static, {'Strict-Transport-Security','max-age=31536000'})

  server = require('https').createServer(tlsConfig, function (req,res) {
    doHttp(req, res)
  })
}



function Access (user, db, method, args) {// auth!
  // if (user && user.name === 'edit') console.log('yessssss!')
  // if (!user || user.name !== 'vc') console.log('fuk')
}

function Auth (user, cb) {
  getHmac({token:user.pass,user:user.user}, function handleHmac (d) {
    if (modes[user.user] === pass) cb(null, { name: user.user, token: d.val })
    if (modes[user.user] !== pass) cb(new Error('wrong pass!'), null)
    if (e) cb(e, null)
  })
}

function getHmac (d, cb) { // USERS '@'
  var hmac = newHmac(ALGO, KEY)
  hmac.setEncoding('hex')
  hmac.write(d.token)
  hmac.end()
  cb({key:'@:'+d.user, val:hmac.read().toString()})
}

// utils!
function compileComponents (event, file) { // CREATE BETTER LIB '!'
  fs.readdir(config.components, function (e, files) {
    var components = {}
    var b = browserify(config.bundleIn)

    files.forEach(function (f) {
      var name = f.split('.')[0]
      var ext = f.split('.')[1]
      if (!components[name]) components[name] = {}
      var buf = fs.readFileSync(config.components+f).toString()
      switch (ext) {
        case 'json' : components[name].pkg = JSON.parse(buf); break;
        case 'hogan' : components[name].html = buf; break;
        case 'js' : b.require(config.components+f, {expose: name}); break;
      }
    })

    db.put('library', JSON.stringify(components))

    var bun = fs.createWriteStream(config.bundleOut)
    b.bundle().pipe(bun)

    bun.on('finish', function () {
      console.log('compiled bundle '+config.bundleIn+' to '+config.bundleOut)
    })
  })
}

function makeIndex (e,res,d) {
  if (d) d = JSON.parse(d)
  if (!d) d = {title:config.title}

  var indexHTML = fs.readFileSync(config.components+'index.hogan').toString()
  fs.writeFileSync(index, stache(indexHTML)(d))
}

function fileUpload(req, res) {
  var form = new formidable.IncomingForm()
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'})
    res.write('received upload:\n\n')
    res.end()
    var blob = fields.blob.split(',')[1]
    fs.writeFileSync(config.uploads+fields.file, blob, {encoding:'base64'})
  })
}

// compile!
fs.watch(config.components, compileComponents)
compileComponents()
makeIndex()
