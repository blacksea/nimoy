var telepath = require('tele')

module.exports = function (usr) { // BRICOLEUR 
  var self = this
  telepath(this)

  if (usr) self.usr = usr

  this.recv = function (buffer) {
    var data = JSON.parse(buffer.toString())
    console.dir(data)
  }

  this.add_conn = function () { // add incoming stream conn > calls recv & is called by send

  }

  this.rm_conn = function () { // remove the connection

  }
}
