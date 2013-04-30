var telepath = require('tele')

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
