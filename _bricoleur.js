var through = require('through')
var cvs

module.exports = function Bricoleur (multiLevel) {
  
  var interface = through(function Write (d) {
    if (!d.key) return null

    var path = d.key.split(':')
    
    if (filter[path[0]]) { filter[path[0]](d); return null }

    if (d.type === 'auth') multiLevel.auth({user:d.user, pass:d.pass}, boot)
  })

  cvs = new Canvas(interface)

  multiLevel.liveStream({reverse:true})
    .pipe(interface)

  return interface
}

function boot (e, res) {
  if (e) console.error(e)
  if (!e && d.origin) cvs._[d.origin].s.write(result)
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

  this._ = {brico : {s: interface}}

  this.put = function (d) { 
    if (d.nimoy && d.nimoy.module) { // add module to db?
      d.uid = d.name+'_'+new Date().getTime()
      self._[d.uid] = self._.render(d)
      return null
    } 
    if (d.type === 'pipe') { // add pipe to db?
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

  this.erase = function (d) {

  }
}

function genUID () {
  return new Date().getTime()
}

function findModule (modules, name) {
  for (m in modules) {
    var id = m
    if (m.match(name)) {
      return modules[m]
      break
    }
  }
}

function findPkg (name) { 
  var modules = JSON.parse(localStorage.library)
  for (m in modules) {
    var id = m
    if (id.match(name)) {
      return modules[m]
      break
    }
  }
}
