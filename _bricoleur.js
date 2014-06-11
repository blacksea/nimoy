var through = require('through')
var cvs

module.exports = function Bricoleur (multiLevel) {

  function boot () {

  }

  var filter = {}

  filter.library = function (d) {
    if (!localStorage.library)
      localStorage.library = d.value
  }

  filter.config = function (d) {
    var lib = JSON.parse(localStorage.library)
    var conf = JSON.parse(d.value)

    cvs._.render = require(conf.rendering)
    cvs.put(search(lib, conf.auth))
    cvs.put({key:'pipe:', value:'login>brico'}) // pipes need to use absolute ids
  }
  
  var interface = through(function Write (d) {
    if (!d.key) return null

    var path = d.key.split(':')

    if (filter[path[0]]) filter[path[0]](d)

    if (d.type === 'auth') {
      multiLevel.auth({user:d.user, pass:d.pass}, function handleAuth (e, res) {
        if (e) { console.error(e); return null }
        if (d.origin) { cvs._[d.origin].s.write(res); boot() }
      })
    }

  })

  cvs = new Canvas(interface)

  multiLevel.liveStream({reverse : true})
    .pipe(interface)

  return interface

}

var Canvas = function (interface) {
  var self = this

  this._ = {brico : {s: interface}}

  this.put = function (d) { 
    if (d.nimoy && d.nimoy.module) { // add module to db?
      d.uid = d.name + '_' + genUID()
      self._[d.uid] = self._.render(d)
      return null
    } 

    var path = d.key.split(':')

    if (path[0] === 'pipe') { // add pipe to db?
      var conn = d.value.split('>')
      var a = search(self._, conn[0])
      var b = search(self._, conn[1])
      a.s.pipe(b.s)
    }
  } 

  this.del = function (d) {
    var keyspace = d.key
    var connection = d.value.split('>')
    var a = search(self, connection[0])
    var b = search(self, connection[1])
    a.s.unpipe(b.s)
    self._[keyspace].erase()
    delete self._[keyspace]
  }

  this.erase = function (d) {  }
}

// UTILS
function genUID () { return new Date().getTime() }

function search (haystack, needle) {
  for (hay in haystack) {
    if (hay.match(needle))
      return haystack[hay]
  }
}
