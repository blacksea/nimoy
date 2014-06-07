var through = require('through')

module.exports = function Bricoleur (multiLevel) {
  var cvs

  var interface = through(function Write (d) {
    if (!d.key) { 
      console.error('bricoleur: unknown input: '+JSON.stringify(d));return null 
    }
   
    var path = d.key.split(':')
    if (filter[path[0]]) filter[path[0]](d)
  })

  cvs = new Canvas(interface)

  multiLevel.liveStream()
    .pipe(interface)

  return interface
}


var filter = {
  'library' : function (d) {
    console.log(d)
  },
  'config' : function (d) {
    console.log(d)
  }
}


var Canvas = function (interface) {
  var self = this

  this._ = { brico : interface }

  this.put = function (d) { 
    var keyspace = d.key
    Canvas._[keyspace] = Canvas._['render'](moduleName)
    var connection = d.value.split('>')
    var a = findModule(connection[0])
    var b = findModule(connection[1])
    a.s.pipe(b.s)
  } 

  this.del = function (d) {
    var keyspace = d.key
    var connection = d.value.split('>')
    var a = findModule(connection[0])
    var b = findModule(connection[1])
    a.s.unpipe(b.s)
    Canvas._[keyspace].erase()
    delete Canvas._[keyspace]
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
