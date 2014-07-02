var hmac = require('crypto-browserify/create-hmac')
var hash = require('crypto-browserify/create-hash')
var config = require('./bricoleurConfig.json')
var Buffer = require('buffer/').Buffer
var through = require('through2')

var Canvas = function (interface) {
  var self = this

  this._ = { brico : { s : interface } }
  this.index = { modules : {}, pipes : {} }

  function parse (d, cbPipe, cbModule) {
    if (typeof d === 'string') { // check for hash!
      (!d.match('>')) ? cbModule(d) : cbPipe(d.split('>'))
    } else if (d instanceof Array) {
      d.forEach(function (item) {
        (!item.match('>')) ? cbModule(item) : cbPipe(item.split('>'))
      })
    } else if (typeof d === 'object' && d.nimoy) cbModule(d)
  }

  this.draw = function (d) { 
    parse (d, function drawPipe (conn) {
      var a = search(self._, conn[0])
      var b = search(self._, conn[1])
      var hash = genUID(conn)
      var key = 'pipe:' + hash + ':' + conn[0] + '|' + conn[1]
      a.s.pipe(b.s)
      self._[key] = [a.id , b.id]
      self.index.pipes[hash] = [a.id, b.id]
    }, function drawModule (nameOrPkg) {
      var pkg = (typeof nameOrPkg !== 'object') 
        ? search(config.library.master, nameOrPkg)
        : nameOrPkg
      var hash = genUID(pkg.name)
      var key = 'module:' + hash + ':' + pkg.name
      self._[key] = self._.render({key:key, value:pkg})
      if (config.library.global[pkg.name]) self.index.modules[hash] = pkg 
    })
  } 

  this.erase = function (d) {
    parse (d, function erasePipe (pipeID) { 
      var a = self._[pipeID][0] 
      var b = self._[pipeID][1]
      a.unpipe(b) 
      delete self._[pipeID]
      delete self.index.pipes[pipeID]
    }, function eraseModule (moduleID) {
      var mod = search(self._, moduleID)
      if (mod) { mod.erase(); delete mod }
      delete self.index.modules[moduleID]
    })
  }

  this.import = function (canvas) {
    console.log(canvas)
    for (m in self.index.modules) {
      if (!search(canvas.modules, m)) cvs.erase(m) 
    }
    for (m in canvas.modules) {
      if (!search(cvs._, m)) cvs.draw(m)
    }
  }

  this.export = function () {
    var cvsExport = {all: [], modules: {}, pipes: {}}
    for (item in cvs._) {
      var  type = item.split(':')[0]
      var  hash = item.split(':')[1]
      if (hash && hash.length === 40) {
        if (type==='module') {
          var pkg = search(config.library.global, item.split(':')[2])
          if (pkg) cvsExport.modules[item] = pkg
        }
        if (type==='pipe') cvsExport.pipes[item] = cvs._[item]
      }
    }
    return cvsExport
  }
}

module.exports = function Bricoleur (db, user) {
  localStorage.library = JSON.stringify(config.library.global)

  var api = {}

  api.auth = function (d) {
    if (!d.value.session) {
      var img = new Buffer(config.uImg).toString()
      var pass = hmac('sha256', img).update(d.value.pass).digest('hex')
      db.auth({name: d.value.name, pass: pass}, handleAuth)
    } else if (d.value.session) {
      db.auth({name: d.value.name, session: d.value.session}, handleAuth)
    }
    function handleAuth (e, res) {
      if (e) { 
        if (!search(cvs._, config.auth))
          cvs.draw([config.auth, config.auth+'>brico']) 
      } else if (!e) {
        sessionStorage[res.name] = res.token
        var login = search(cvs._, config.auth)
        if (typeof login ==='object') cvs.erase(login.id)
        if (config.users[user].canvas) {
          cvs.draw(config.users[user].canvas.modules)
          cvs.draw(config.users[user].canvas.pipes)
        }
        return false
      }
    }
  }

  api.deauth = function (d) {
    db.deauth(function () {
      delete sessionStorage[user] 
      var path = (!getPath()) ? home : home + getPath()
    })
  }

  api.data = function (d) {
    if (d.type === 'put') db.put(d.key,d.value)
    if (d.type === 'get' && d.origin) { // write back to origin
      var origin = search(cvs._, d.key.split(':')[1])
      db.get(d.key, function (e, res) {
        if (e) { console.error(e); return false }
        origin.s.write(res)
      })
    }
  }

  api.draw = function (d) { cvs.draw(d.value) }

  api.erase = function (d) { cvs.erase(d.value) }

  api.load = function (d) {
    var name = d.value
    db.get('canvas:' + name, function (e, canvas) {
      if (e) { console.error(e); return false }
      cvs.import(canvas)
    })
  }

  api.save = function (d) {
    var key = 'canvas:' + d.value
    db.put(key, cvs.export())
  }

  var s = through.obj(function Write (d, enc, next) {
    if (d.key) {
      var path = d.key.split(':')[0]
      if (api[path]) api[path](d)
    }
    next()
  })

  var cvs = new Canvas() 
  cvs._.brico = { s : s } 
  cvs._.render = require(config.canvasRender) 

  if (sessionStorage[user])
    api.auth({value: {name: user, session: sessionStorage[user]}})

  if (!sessionStorage[user] && user !== 'default')
    cvs.draw([config.auth, config.auth+'>brico'])

  db.liveStream({reverse : true})
    .on('data', sync)

  function sync (d) { 
    var path = d.key.split(':')[0]
    if (path === 'data') {
      var origin = search(cvs._, d.key.split(':')[1]) // update module
      if (origin) origin.s.write(d)
    }
  }

  window.cvs = cvs._

  return s
}

// UTILS
function genUID (name) { 
  var r = Math.random().toString().slice(2)
  return hash('sha1').update(name+r).digest('hex')
} 
function search (haystack, needle) {
  for (hay in haystack) {
    if (hay.match(needle)) return haystack[hay]
  }
}
function getPath () { 
  if (!window.location.hash) return false
  if (window.location.hash) return window.location.hash.slice(1)
}
