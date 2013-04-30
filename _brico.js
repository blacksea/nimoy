var telepath = require('tele')
, stream = require('stream')
, async = require('async')

module.exports = function (usr) { // BRICOLEUR 
  var self = this
  telepath(this)

  if (usr) self.usr = usr

  this.recv = function (data) {
    console.dir(usr.host)
    console.dir(data.toString())
  }
}
