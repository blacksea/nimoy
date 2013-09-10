// NODE ENVIRONMENT
var websocketStream = require('websocket-stream')
var ws = require('ws').Server
var asyncMap = require('slide').asyncMap
var readdir = require('fs').readdir
var http = require('http')
var filed = require('filed')
var Map = require('./_map')
var Data = require('levelup')
var Compiler = require('./_cmp')
var Bricoleur = require('./_brico')

module.exports = Environment

function Environment (opts, running) { 
  var self = this
  var FILES = []
  var nodeMap = []
  var browserMap = []
  var data = null
  var _ = {} // brico scope

  // HTTP SERVER :: HANDLE STATIC FILES
  readdir(opts.path_wilds, function findStaticFiles (e,files) {
    if (e) console.error(e)
    files.forEach(function matchFile (file) {
      if (file[0] === '_') FILES.push(file)
    })
  })
  function handleReqs (req, res) {
    var headers = req.headers
    , origin = headers.referer
    , agent = headers['user-agent']
    , host = headers.host

    getStaticFile(req.url, function pipeFileStream (filepath) {
      if (filepath !== null) filed(filepath).pipe(res)
    })
  }
  function getStaticFile (path, filePath) {
    if (path === '/') path = '/_index.html'
    var file = path.replace('/','')

    asyncMap(FILES, function matchPathToStatic (staticFile,cb) {
      if (file === staticFile) filePath(opts.path_wilds+'/'+file)
      if (file !== staticFile) filePath(null)
    }, function () {
      console.log('for req '+path+' streamed file '+file)
    })
  }
  var server = http.createServer(handleReqs)
  server.listen(opts.port, function () {
    var uid = parseInt(process.env.SUDO_UID)
    if (uid) process.setuid(uid)
    data = Data(opts.db) // dont' run level as sudo
    running() // we're running cb!
  })
  
  // CREATE WEBSOCKET
  function handleSoc (soc) { // fix this thing!
    var ws = websocketStream(soc)
    var headers = soc.upgradeReq.headers
    var key = headers['sec-websocket-key']
    var host = headers.host

    _[host].addSocket(key)

    ws.pipe(_[host][key]).pipe(ws)

    // SEND BROWSER BRICO MODULE MAP AND USER ENV DATA
    asyncMap(_[host].moduleMap, function (mod,cb) {
      ws.write(JSON.stringify(mod))
      cb()
    }, function () {
      var user = self.users[host]
      ws.write(JSON.stringify(user))
    })
    ws.on('end', function (d) {
      console.log('disconnected')
    })
  }
  var webSocket = new ws({server:server})
  webSocket.on('connection', handleSoc)
  
  // LOAD ENVIRONMENT
  this.load = function (loaded) { 
    // expose compile/map options 
    var compileOpts = {
      path_wilds:opts.path_wilds,
      path_styl:opts.path_styl,
      path_css:opts.path_css,
      path_bundle:opts.path_bundle,
      path_env:opts.path_js,
      compress:false
    }
    data.get('users', function LoadBricos (e, val) { 
      var users = JSON.parse(val)
      self.users = users
      for (u in users) {
        _[users[u].host] = new Bricoleur() 
      }
    })
    var _cmp = new Compiler(compileOpts) 
    var _map = new Map({end:false,path_wilds:opts.path_wilds}, function (s) {// map wilds
      s.pipe(_cmp.s)
      for (brico in _) {
        _cmp.s.pipe(_[brico].metaStream)
      }
      s.on('end', function () {
        console.log('mapping done')
      })
    })   
  }

  // ADD A NEW USER
  this.addUser = function (user, cb) {
    var id = user.host
    data.get('users', function checkUsers (e, val) {
      if (!val) var users = {}
      if (val) var users = JSON.parse(val)
      users[id] = user
      data.put('users', JSON.stringify(users), function (e) {
        if (e) console.error(e)
        cb()
      })
    })
  }
}
