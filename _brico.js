var telepath = require('tele')
// a small module to handle/manage connections?

module.exports = function (usr) { // BRICOLEUR 
  var self = this
  telepath(this)

  if (usr) self.usr = usr

  this.recv = function (buffer) {
    var data = JSON.parse(buffer.toString())
    if (data.id) {
      console.log(data.id)
    }
    console.dir(usr.host+' '+data.id)
  }
}
