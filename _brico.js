var telepath = require('tele')

module.exports = function (usr) { // BRICOLEUR 
  var self = this
  telepath(this)

  if (usr) self.usr = usr

  this.recv = function (buffer) {
    var data = JSON.parse(buffer.toString())
    console.dir(usr.host+' '+data.id)
  }
}
