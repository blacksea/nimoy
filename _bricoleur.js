var through = require('through')

module.exports = function Bricoleur (multiLevel) {

  var interface = through(function Write (d) { // single filter function
   
    // user 
    
    // config
    
    // lib/index

    if (d.key) { // look at keyspace first
      var parts = d.key.split(':')
      var name = parts[0]

      switch (keyspace) { // ?
        case 'config' : break;
        case 'library' : break;
        case 'user' : break;
        default : break;
      }
    }
  })
  
  var canvas = { // ! to generic
    put : function (d) { 
      var keyspace = d.key
      canvas._[keyspace] = canvas._['render'](moduleName)

      var connection = d.value.split('>')
      var a = findModule(connection[0])
      var b = findModule(connection[1])
      a.s.pipe(b.s)
    }, 
    del : function (d) {
      var keyspace = d.key

      var connection = d.value.split('>')
      var a = findModule(connection[0])
      var b = findModule(connection[1])
      a.s.unpipe(b.s)
      
      canvas._[keyspace].erase()
      delete canvas._[keyspace]
    },
    get : function (d) { // grab key
      var keyspace = d.key.split(':')
    },
    _ : { brico : interface }
  }

  // branch for keyspace and type

  multiLevel.liveStream()
    .pipe(interface)

  interface.canvas = canvas

  return interface
}

function genUID () {// utility functions
  return new Date().getTime()
}

 
