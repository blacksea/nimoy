var through = require('through')
var conf // arrg globals :(  !!!
var cvs
var db

// on load parse / url and build with user session

// define session / user abilities 
  
var api = {
  auth : function (d) { // create a new session
    db.auth({ user:d.user, pass:d.pass }, function (e, res) {
      if (e) { console.error(e); return false }
      if (d.origin) cvs._[d.origin].s.write(res); 
    })
  }, 
  session : function (d) {
    // session pre-loads modules
    cvs.draw(search(lib, conf.auth))
    cvs.draw({key:'pipe:'+genUID(), value:conf.auth+'>brico'})

    if (!sessionStorage[user]) {
      (user === 'default')
        ? eventStream.emit('data', auth)
        : C.draw()
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
        console.log(p)
        cvs.draw({key:'pipe:'+genUID(), value:p})
      })
    }
  },
  config : function (d) {
    var lib = JSON.parse(localStorage.library)
    conf = JSON.parse(d.value)

    cvs._.render = require(conf.canvasRender) // set render!

    // install library!
    
    // start a new session! 

    
  },
  library : function (d) { // load library with config!
    if (!d.type) d.type = 'put'
    if (d.type === 'put') {
      localStorage.library = d.value
    } else if (d.type === 'get' && d.origin) {
      cvs._[d.origin].s.write(JSON.parse(localStorage.library))
    }
  }
}

module.exports = function Bricoleur (multiLevel) {

  var interface = through(function Write (d) {
    if (!d.key) return // ignore if !key property
    var path = d.key.split(':')
    if (api[path[0]]) api[path[0]](d)
  })

  db = multiLevel

  cvs = new Canvas(interface)

  window.cvs = cvs

  multiLevel.liveStream({reverse : true})
    .pipe(interface)

  return interface
}

var Canvas = function (interface) { // to save stringify cvs._ to db
  var self = this

  this._ = { brico : { s : interface } }

  this.draw = function (d) { // standard object interface!!!
    if (d.nimoy && d.nimoy.module) { // add module to db?
      d.uid = 'module:'+d.name + ':' + genUID()
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
    if (!d.key) { console.error('CANVAS: bad input',d); return false }

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

function search (haystack, needle) { // loop through
  for (hay in haystack) {
    if (hay.match(needle)) return haystack[hay]
  }
}
