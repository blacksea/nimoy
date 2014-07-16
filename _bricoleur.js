var hmac = require('crypto-browserify/create-hmac')
var config = require('./bricoleurConfig.json')
var Buffer = require('buffer/').Buffer
var through = require('through2')
var utils = require('utils')

drawPipe = function (conn) {
  var a = search(self._, conn[0])
  var b = search(self._, conn[1])
  var hash = genUID(conn)
  var key = 'pipe:' + hash + ':' + conn[0] + '|' + conn[1]
  a.pipe(b)

  this._[key] = [a , b]
  this.index.pipes[hash] = [a.id, b.id]
}

drawModule = function (nameOrPkg) {
    var pkg = (typeof nameOrPkg !== 'object') 
      ? search(config.library.master, nameOrPkg)
    : nameOrPkg
  var hash = genUID(pkg.name)
  var key = 'module:' + hash + ':' + pkg.name

  this._[key] = this._.render(pkg, hash)
  if (config.library.global[pkg.name]) this.index.modules[hash] = pkg 
}

erasePipe = function (pipeID) { 
  var a = this._[pipeID][0] 
  var b = this._[pipeID][1]
  a.unpipe(b) 
  delete this._[pipeID]
  delete this.index.pipes[pipeID]
}

eraseModule = function (moduleID) {
  var mod = search(this._, moduleID)
  if (mod) { 
    document.body.removeChild(document.getElementById(moduleID))
    delete mod 
  }
  delete this.index.modules[moduleID]
}

readCanvas = function (canvasName) {
  for (m in self.index.modules) {
    if (!search(canvas.modules, m)) canvas.erase.module(m) 
  }
  for (m in canvas.modules) {
    if (!search(canvas._, m)) canvas.draw.module(m)
  }
}

writeCanvas = function (canvasName) {
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

function parse (d, cbPipe, cbModule) {
  if (typeof d === 'string') { 
    (!d.match('>')) ? cbModule(d) : cbPipe(d.split('>'))
  } else if (d instanceof Array) {
    d.forEach(function (item) {
      (!item.match('>')) ? cbModule(item) : cbPipe(item.split('>'))
    })
  } else if (typeof d === 'object' && d.nimoy) cbModule(d)
}

auth = function (d) {
  if (!d.value.session) {
    var img = new Buffer(config.uImg).toString()
    var pass = hmac('sha256', img).update(d.value.pass).digest('hex')
    db.auth({name: d.value.name, pass: pass}, handleAuth)
  } else if (d.value.session) {
    db.auth({name: d.value.name, session: d.value.session}, handleAuth)
  }
  function handleAuth (e, res) {
    if (e) { 
      if (!search(canvas._, config.auth))
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

deauth = function () {
  db.deauth(function () {
    delete sessionStorage[user] 
    var path = (!getPath()) ? home : home + getPath()
  })
}

data = function (d) {
  if (d.type === 'put') db.put(d.key,d.value)
  if (d.type === 'get' && d.origin) {
    var origin = search(canvas._, d.key.split(':')[1])
    db.get(d.key, function (e, res) {
      if (e) { console.error(e); return false }
      origin.s.write(res)
    })
  }
}

load = function (d) {
  var name = d.value
  db.get('canvas:' + name, function (e, canvas) {
    if (e) { console.error(e); return false }
    canvas.import(canvas)
  })
}

save = function (d) {
  var key = 'canvas:' + d.value
  db.put(key, canvas.export())
}

draw = function (d) { 
  function parse (d, cbPipe, cbModule) {
    if (typeof d === 'string') { 
      (!d.match('>')) ? canvas.draw.module : canvas.draw.pipe
    } else if (d instanceof Array) {
      d.forEach(function (item) {
        (!item.match('>')) ? canvas.draw.module : canvas.draw.pipe
      })
    } else if (typeof d === 'object' && d.nimoy) cbModule(d)
  }
}

erase = function (d) {
  canvas.erase
}

module.exports = function Bricoleur (db, user) {
  localStorage.library = JSON.stringify(config.library.global)

  var s = through.obj(function Write (d, enc, next) {
    if (d.key) {
      var path = d.key.split(':')[0]
      if (api[path]) api[path](d)
    }
    next()
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

  // boot
  canvas._.render = require(config.canvasRender) 

  if (sessionStorage[user])
    api.auth({ value: { name: user, session: sessionStorage[user] } })

  if (!sessionStorage[user] && user !== 'default')
    api.draw([config.auth, config.auth+'>brico'])

  // end boot

  window.cvs = canvas._

  return s
}
