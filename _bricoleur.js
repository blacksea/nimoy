var through = require('through')
var cvs

module.exports = function Bricoleur (multiLevel) {
  
  var interface = through(function Write (d) {
    if (!d.key) { 
      console.error('bricoleur: unknown input: '+JSON.stringify(d));
      return null 
    }

    var path = d.key.split(':')
    
    if (filter[path[0]]) {
      filter[path[0]](d)
      return null
    }
  })
  cvs = new Canvas(interface)

  multiLevel.liveStream({reverse:true})
    .pipe(interface)

  return interface
}

var filter = {
  'library' : function (d) {
    if (!localStorage.library) localStorage.library = d.value
  },
  'config' : function (d) { // boot!
    var conf = JSON.parse(d.value)
    var authPkg = findPkg(conf.auth)

    cvs._.render = require(conf.rendering)
    cvs.put(authPkg)
    cvs.put({type:'pipe', key:'pipe:000', value:'login>brico'})
  }
}

var Canvas = function (interface) {
  var self = this

  this._ = { brico : {s: interface} }

  this.put = function (d) { 
    if (d.nimoy && d.nimoy.module) {
      self._[d.name] = self._.render(d)
      return null
    } 
    if (d.type === 'pipe') {
      var conn = d.value.split('>')
      var a = findModule(self._, conn[0])
      var b = findModule(self._, conn[1])
      a.s.pipe(b.s)
    }
  } 

  this.del = function (d) {
    var keyspace = d.key
    var connection = d.value.split('>')

    var a = findModule(self, connection[0])
    var b = findModule(self, connection[1])

    a.s.unpipe(b.s)

    self._[keyspace].erase()

    delete self._[keyspace]
  }

  this.get = function (d) { // grab key
    var keyspace = d.key.split(':')
  }

  this.erase = function (d) {
  }
}

function genUID () {// utility functions
  return new Date().getTime()
}

function findModule (modules, name) {
  for (m in modules) {
    if (name.match(m)) {
      return modules[m]
      break
    }
  }
}

function findPkg (name) { // should be more robust!
  var modules = JSON.parse(localStorage.library)
  for (m in modules) {
    if (name.match(modules[m].name)) {
      return modules[m]
      break
    }
  }
}
