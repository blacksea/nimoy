var through = require('through')
var user
var conf 
var cvs
var db

var api = {
  auth : function (d) {
    if (d.type === 'put') {
      db.auth({ user:d.user, pass:d.pass }, function (e, res) {
        if (e) { console.error(e); return false }
        // set session!
        sessionStorage[res.name] = res.token
        api.canvas(conf.users[user])
        if (d.origin) cvs._[d.origin].s.write(res)
      })
    } else if (d.type === 'del') { 
      // redraw canvas
      delete sessionStorage[user] // kill session!
    }
  }, 
  canvas : function (d) {
    if (d.modules) {
      d.modules.forEach(function (m) {
        cvs.draw(search(JSON.parse(localStorage.library), m)) 
      })
    }
    if (d.pipes) {
      d.pipes.forEach(function (p) {
        cvs.draw({key:'pipe:'+genUID(), value:p})
      })
    }
  },
  config : function (d) {
    conf = JSON.parse(d.value)
    localStorage.library = JSON.stringify(conf.library) // sync on fresh
    cvs._.render = require(conf.canvasRender) // set render!
    
    if (!sessionStorage[user] && user !== 'default') {
      cvs.draw(search(conf.library, conf.auth))
      cvs.draw({key:'pipe:'+genUID(),value:conf.auth+'>brico'})
    } else {
      api.canvas(conf.users[user])
    } 
    // implement a thorough check to make sure users and tokens match
  }
}

module.exports = function Bricoleur (multiLevel, usr) {
  user = usr
  db = multiLevel

  var interface = through(function Write (d) {
    if (!d.key) return // ignore if !key property

    var path = d.key.split(':')

    if (api[path[0]]) api[path[0]](d)
  })

  cvs = new Canvas(interface) 

  multiLevel.liveStream({reverse : true})
    .pipe(interface)

  return interface
}

var Canvas = function (interface) { // to save stringify cvs._ to db
  var self = this

  this._ = { brico : { s : interface } }

  this.draw = function (d) { 
    if (d.nimoy && d.nimoy.module) { // standard object interface!!!
      d.uid = 'module:' + d.name + ':' + genUID()
      self._[d.uid] = self._.render(d)
      return 
    } 

    var path = d.key.split(':')

    if (path[0] === 'pipe') {
      var conn = d.value.split('>')
      var a = search(self._, conn[0])
      var b = search(self._, conn[1])

      self._[d.key] = d.value
      a.s.pipe(b.s)
    }
  } 

  this.erase = function (d) {
    if (!d.key) { console.error('CANVAS: bad input', d); return false }

    var path = d.key.split(':')

    if (path[0] === 'pipe') {
      var conn = d.value.split('>')
      var a = search(self._, conn[0])
      var b = search(self._, conn[1])
      a.unpipe(b)
      delete self._[d.key]
      return
    }

    self._[d.key].erase()
    delete self._[d.key]
  }
}

// UTILS

function genUID () {
  return Math.random().toString().slice(2) 
} 

function search (haystack, needle) {
  for (hay in haystack) {
    if (hay.match(needle)) return haystack[hay]
  }
}
