var hmac = require('crypto-browserify/create-hmac')
var Buffer = require('buffer/').Buffer
var through = require('through2')
var utils = require('utils')


module.exports = function Bricoleur (db, user, config) { //====================

  if (config.canvasRender) var render = require(config.canvasRender)

  var canvas = { index : {} }

  // boot =====================================================================
  
  if (sessionStorage[user])
    api.auth({ value: { name: user, session: sessionStorage[user] } })

  if (!sessionStorage[user] && user !== 'default')
    api.draw([config.auth, config.auth+'>brico'])

  // end boot =================================================================
  
  var interface = through.obj(function Write (d, enc, next) {
    
    if (d.key) {
      var path = d.key.split(':')[0]
      if (api[path]) api[path](d)
    }

    function parse (d, cbPipe, cbModule) {
      if (typeof d === 'string') { 
        (!d.match('>')) ? cbModule(d) : cbPipe(d.split('>'))
      } else if (d instanceof Array) {
        d.forEach(function (item) {
          (!item.match('>')) ? cbModule(item) : cbPipe(item.split('>'))
        })
      } else if (typeof d === 'object' && d.nimoy) cbModule(d)
    }

    next()
    put(obj, render)

  })

  db.liveStream({reverse : true})
    .on('data', sync)

  function sync (d) { 
    var path = d.key.split(':')[0]
    if (path === 'file') console.log(d.key) // files!!!
    if (path === 'data') {
      var origin = search(canvas._, d.key.split(':')[1])
      if (origin) origin.s.write(d)
    }
  }

  return interface

} // ==========================================================================


// BRICOLEUR API ==============================================================

var api = {}

api.get = function (d, cb) {
  db.get(d.key, function returnResult (e, res) {
    if (e) cb(e, null)
    if (!e) cb(null, res)
  })
}

api.put = function (d, cb) {
  var a = utils.search(self._, conn[0])
  var b = utils.search(self._, conn[1])
  var hash = genUID(conn)
  var key = 'pipe:' + hash + ':' + conn[0] + '|' + conn[1]

  if (!a.pipe || !b.pipe) cb(new Error('unpipable!'), null)

  a.pipe(b)

  canvas[key] = [a , b]
  canvas.index.pipes[hash] = [a.id, b.id]

  // mod

  var pkg = (typeof nameOrPkg !== 'object') 
    ? utils.search(config.library.master, nameOrPkg) 
    : nameOrPkg

  if (!pkg) cb(new Error('package not found'), null)

  var hash = genUID(pkg.name)
  var key = 'module:' + hash + ':' + pkg.name
  canvas[key] = render(pkg, hash)
  if (config.library.global[pkg.name]) 
    canvas.index.modules[hash] = pkg 
}

api.del = function (d, cb) {
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

api.read = function (canvasName) { 
  for (m in self.index.modules) {
    if (!search(canvas.modules, m)) canvas.erase.module(m) 
  }
  for (m in canvas.modules) {
    if (!search(canvas._, m)) canvas.draw.module(m)
  }
}

api.write = function (canvasName) {
  var cvsExport = {all: [], modules: {}, pipes: {}}
  for (item in canvas._) {
    var  type = item.split(':')[0]
    var  hash = item.split(':')[1]
    if (hash && hash.length === 40) {
      if (type === 'module') {
        var pkg = search(config.library.global, item.split(':')[2])
        if (pkg) cvsExport.modules[item] = pkg
      }
      if (type === 'pipe') cvsExport.pipes[item] = canvas._[item]
    }
  }
  return cvsExport
}

api.auth = function (d, cb) {
  if (!d.session) {
    var img = new Buffer(config.uImg).toString()
    var pass = hmac('sha256', img).update(d.value.pass).digest('hex')
    db.auth({name: d.name, pass: pass}, handleAuth)
  } else if (d.session) {
    db.auth({name: d.name, session: d.session}, handleAuth)
  }

  function handleAuth (e, res) {
    if (e && !search(canvas, config.auth)) { 
      api.put([config.auth, config.auth+'>brico'])
      api.draw([config.auth, config.auth+'>brico']) 
    } else if (!e) {
      sessionStorage[res.name] = res.token
      var login = search(canvas._, config.auth)
      if (typeof login ==='object') api.erase(login.id)
      if (config.users[user].canvas) {
        api.draw(config.users[user].canvas.modules)
        api.draw(config.users[user].canvas.pipes)
      }
      return false
    }
  }
} 

api.deauth = function (d, cb) {
  db.deauth(function () {
    delete sessionStorage[user] 
    var path = (!getPath()) ? home : home + getPath()
  })
}

// login!
<div class="login">
  <form id="loginForm">
    <input type="password" placeholder="enter password" />
    <input class="send submit" type="submit" value="{{mode}}" style="display:none;"/>
  </form>
</div>

var user = (window.location.host.split('.').length ===  3)
  ? window.location.host.split('.')[0]
  : 'default'

render(document.body, template.toString(), id)(submit) // render+bind

function submit (el) {
  var form = el.querySelector('#loginForm')
  form.addEventListener('submit', function (e) {
    e.preventDefault()
    var d = {
      key : 'auth',
      value : {
        origin: id,
        name: user,
        pass : e.target[0].value
      }
    }
    s.push(d)
  }, false)
}


