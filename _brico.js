var telepath = require('tele')
, stream = require('stream')

module.exports = function (usr) { // BRICOLEUR : split this into srvr/clnt func? 
  var self = this
  telepath(this)

  var map = {
    client: [],
    server: []
  }

  if (usr) self.usr = usr
    
  this.recv = function (buffer) {
    var data = JSON.parse(buffer.toString())

    if (data.scope && data.id && data.desc) { // it's module data!
      for (var i=0;i<data.scope.length;i++) {
        map[data.scope[i]].push(data)
      }
    } else { // who knows wtf it is : do something
      
    }      
  }

  this.in.on('finish', function () { // should be more generic somehow ......
     console.log(map) // do something with map : how to organize use modules!
  })

  // prob. temp hack for adding server side stream conn's
  // ----------------------------------------------------
  this.addConnection = function (key) {
    self[key] = {}
    var s = self[key]

    // add write stream
    s.in = new stream.Writable()
    s.in._write = function (chunk, encoding, cb) {
      self.recv(chunk)
      cb()
    }

    // add read stream
    s.out = new stream()
    s.out.readable = true
    s.send = function (data) {
      s.out.emit('data',JSON.stringify(data))
    }
  }

  this.removeConnection = function (key) {
    self[key].out.emit('close')
    delete self[key]
  }// ---------------------------------------------------
}
