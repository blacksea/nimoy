var through = require('through')
var cvs

module.exports = function Bricoleur (multiLevel) {
  var conf = null

  function boot (user) {
    if (user.modules) {
      user.modules.forEach(function (m) {
        cvs.draw(search(JSON.parse(localStorage.library), m)) 
      })
    }
    if (user.pipes) {
      user.pipes.forEach(function (p) {
        cvs.draw({key:'pipe:'+genUID(), value:p})
      })
    }
  }

  var filter = {}

  filter.library = function (d) {
    if (!localStorage.library) localStorage.library = d.value
  }

  filter.config = function (d) {
    var lib = JSON.parse(localStorage.library)
    conf = JSON.parse(d.value)

    cvs._.render = require(conf.canvasRender)
    cvs.draw(search(lib, conf.auth))
    cvs.draw({key:'pipe:'+genUID(), value:'login>brico'}) // pipes need to use ids
  }

  filter.auth = function (d) {
    multiLevel.auth({user:d.user, pass:d.pass}, function handleAuth (e, res) {
      if (e) { console.error(e); return false }
      if (d.origin) { 
        cvs._[d.origin].s.write(res); 
        boot(conf.users[d.user])  // needs to be called with user config 
      }
    })
  }
  
  var interface = through(function Write (d) {
    if (!d.key) return
    var path = d.key.split(':')
    if (filter[path[0]]) filter[path[0]](d)
  })

  cvs = new Canvas(interface)

  window.cvs = cvs

  multiLevel.liveStream({reverse : true})
    .pipe(interface)

  return interface
}

var Canvas = function (interface) {
  var self = this

  this._ = { brico : { s: interface } }

  this.draw = function (d) { 
    if (d.nimoy && d.nimoy.module) { // add module to db?
      d.uid = d.name + '_' + genUID()
      self._[d.uid] = self._.render(d)
      return 
    } 
    var path = d.key.split(':')
    if (path[0] === 'pipe') { // add pipe to db?
      var conn = d.value.split('>')
      var a = search(self._, conn[0])
      var b = search(self._, conn[1])
      self._[d.key] = d.value
      a.s.pipe(b.s)
    }
  } 

  this.erase = function (d) {
    var path = d.key.split(':')

    if (path[0] === 'pipe') {
      var conn = d.value.split('>')
      var a = search(self._, conn[0])
      var b = search(self._, conn[1])
      a.unpipe(b)

      delete self._[path]

      return
    }

    self._[path].erase()
    delete self._[path]
  }
}

function genUID () { return new Date().getTime() } // UTILS

function search (haystack, needle) { // loop through
  for (hay in haystack) {
    if (hay.match(needle)) return haystack[hay]
  }
}
