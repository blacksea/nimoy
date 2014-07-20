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

  if (config.rendering) var render = require(config.rendering)

  var s = through.obj(function interface (d, enc, next) {
    if (!d.key) {
      next()
      return false
    }
    var path = d.key.split(':')[0]

    if (path === 'put' && typeof d.value === 'string') 
      d.type = (!d.match('>')) ? 'module' : 'pipe'

    if (api[path]) 
      api[path](d, handleOutput)

    function handleOutput (e, d) {

    }

    next() // !?
  })

  db.liveStream({reverse : true})
    .on('data', sync)

  function sync (d) { 
    var path = d.key.split(':')[0]
    if (path === 'file') console.log(d.key)
    if (path === 'data') {}
  }


  // BRICOLEUR API >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  var canvas = {}

  var api = {}

  api.get = function (d, cb) {
    db.get(d.key, function returnResult (e, res) {
      if (e) cb(e, null)
      if (!e) cb(null, res)
    })
  }

  api.put = function (d, cb) { 
    if (d.type === 'pipe') {
      var conn = d.value

      var a = utils.search(canvas, conn[0])
      var b = utils.search(canvas, conn[1])
      var hash = genUID(conn)

      if (!a.pipe || !b.pipe) cb(new Error('unpipeable!'), null)

      a.pipe(b)
      
      canvas.index.pipes[hash] = [a.id, b.id] // call db 

      if (cb) cb(null, 200)

    } else if (d.type === 'module') {
      var nameOrPkg = d.value

      var pkg = (typeof nameOrPkg !== 'object') // mod
        ? utils.search(config.library.master, nameOrPkg) 
        : nameOrPkg

      if (!pkg) console.error(d)
        rendering
      var hash = utils.UID(pkg.name)
      var key = 'module:' + hash + ':' + pkg.name
      canvas[hash] = render(pkg, hash)

      if (pkg.data)
        db.put({key:'module:'+hash+':'+pkg.name, value: pkg.data})

      if (config.library.global[pkg.name]) 
        canvas.index.modules[hash] = pkg 

      if (cb) cb(null, 200)
    }
  }

  api.del = function (d, cb) {
    if (d.type === 'pipe') {
      // parse input
      var a = this._[hash][0] 
      var b = this._[hash][1]

      a.unpipe(b) 

      delete this._[hash]
      delete this.index.pipes[hash]
    } else if (d.type === 'module') {
      // mod
      var mod = search(this._, hash)
      if (mod) { 
        document.body.removeChild(document.getElementById(hash))
        delete mod 
      }

      delete this.index.modules[hash]
    }
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
      if (e) {
        console.error(e)
        if (!document.querySelector('.login')) document.body.appendChild(login)
      } else if (!e) {
        sessionStorage[res.name] = res.token
        api.put({type:'module', value:config.editor})
        if (document.querySelector('.login')) document.body.removeChild(login)
        // load page!
        return false
      }
    }
  } 

  api.deauth = function (d, cb) {
    db.deauth(function () {
      // remove editor!
      delete sessionStorage[user] 
      var path = (!getPath()) ? home : home + getPath()
    })
  } 
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  // login ui >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  login = document.createElement('div')
  login.className = 'login'
  login.innerHTML = '<form id="loginForm">'
    + '<input type="password" placeholder="enter password" />'
    + '<input type="submit" value="edit" style="display:none;" />'
    + '</form>'

  login.querySelector('#loginForm')
    .addEventListener('submit', api.auth, false)
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    

  // boot >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  if (sessionStorage[user])
    api.auth({ name : user, session : sessionStorage[user] })

  if (!sessionStorage[user] && user !== 'default') {
    document.body.appendChild(login)
  }
  // end boot <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  return s

} // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
