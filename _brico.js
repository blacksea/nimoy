var telepath = require('tele')
, stream = require('stream')

module.exports = function (usr) { // BRICOLEUR 
  var self = this
  telepath(this)

  if (usr) self.usr = usr

  this.recv = function (buffer) {
    var data = JSON.parse(buffer.toString())
    console.dir(data)
  }

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
      s.out.emit('data',data)
    }
  }

  this.rmConnection = function (key) {
    delete self[key]
  }
}
