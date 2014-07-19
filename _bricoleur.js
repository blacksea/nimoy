var hmac = require('crypto-browserify/create-hmac')
var Buffer = require('buffer/').Buffer
var through = require('through2')
var utils = require('utils')

var config
var login
var user
var db


module.exports = function Bricoleur (multilevel, usr, conf) { // >>>>>>>>>>>>>>
  db = multilevel
  config = conf
  user = usr

  if (config.canvasRender) var render = require(config.canvasRender)

  var s = through.obj(function interface (d, enc, next) {
    if (d.key) {
      var path = d.key.split(':')[0]
      if (api[path]) api[path](d)
    }
    next()
  })

  // boot >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  if (sessionStorage[user])
    api.auth({ name : user, session : sessionStorage[user] })

  if (!sessionStorage[user] && user !== 'default') {
    document.body.appendChild(login)
  }
  // end boot <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  db.liveStream({reverse : true})
    .on('data', sync)

  function sync (d) { 
    var path = d.key.split(':')[0]
    if (path === 'file') console.log(d.key)
    if (path === 'data') {
      var origin = search(canvas._, d.key.split(':')[1])
      if (origin) origin.s.write(d)
    }
  }

  // BRICOLEUR API >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  
  function parse (d, cbPipe, cbModule) {
    if (typeof d === 'string') { 
      (!d.match('>')) ? cbModule(d) : cbPipe(d.split('>'))
    } else if (d instanceof Array) {
      d.forEach(function (item) {
        (!item.match('>')) ? cbModule(item) : cbPipe(item.split('>'))
      })
    } else if (typeof d === 'object' && d.nimoy) cbModule(d)
  }

  var canvas = {}

  var api = {}

  api.get = function (d, cb) {
    db.get(d.key, function returnResult (e, res) {
      if (e) cb(e, null)
      if (!e) cb(null, res)
    })
  }

  api.put = function (d, cb) { // place in canvas / db
    var a = utils.search(canvas, conn[0])
    var b = utils.search(canvas, conn[1])
    var hash = genUID(conn)
    var key = 'pipe:' + hash + ':' + conn[0] + '|' + conn[1]

    if (!a.pipe || !b.pipe) cb(new Error('unpipable!'), null)

    a.pipe(b)

    canvas[key] = [a, b]
    
    canvas.index.pipes[hash] = [a.id, b.id] // call db 

    var pkg = (typeof nameOrPkg !== 'object') // mod
      ? utils.search(config.library.master, nameOrPkg) 
      : nameOrPkg

    if (!pkg) cb(new Error('package not found'), null)

    var hash = genUID(pkg.name)
    var key = 'module:' + hash + ':' + pkg.name
    canvas[key] = render(pkg, hash)

    if (pkg.data)
      db.put({key:'module:'+hash+':'+pkg.name, value: pkg.data})

    if (config.library.global[pkg.name]) 
      canvas.index.modules[hash] = pkg 
  }

  api.del = function (d, cb) {
    // parse input
    var a = this._[hash][0] 
    var b = this._[hash][1]

    a.unpipe(b) 

    delete this._[hash]
    delete this.index.pipes[hash]

    // mod
    var mod = search(this._, hash)
    if (mod) { 
      document.body.removeChild(document.getElementById(hash))
      delete mod 
    }

    delete this.index.modules[hash]
  }

  api.auth = function (d, cb) {
    if (!d.session && d.target.id === 'loginForm') { // is dom event
      d.preventDefault()
      var img = new Buffer(config.uImg).toString()
      var pass = hmac('sha256', img).update(d.target[0].value).digest('hex')
      db.auth({name: 'edit', pass: pass}, handleAuth)
    } else if (d.session) {
      db.auth({name: d.name, session: d.session}, handleAuth)
    }

    function handleAuth (e, res) {
      if (e && document.querySelector('.login')) {
        console.log(e)
      } else if (!e) {
        sessionStorage[res.name] = res.token
        if (document.querySelector('.login')) document.body.removeChild(login)
        // load omni && then load page
        return false
      }
    }
  } 

  api.deauth = function (d, cb) {
    db.deauth(function () {
      delete sessionStorage[user] 
      var path = (!getPath()) ? home : home + getPath()
    })
  } // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  return s
} // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// login ui >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
login = document.createElement('div')
login.className = 'login'
login.innerHTML = '<form id="loginForm">'
  + '<input type="password" placeholder="enter password" />'
  + '<input type="submit" value="edit" style="display:none;" />'
  + '</form>'

login.querySelector('#loginForm')
  .addEventListener('submit', api.auth, false)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
