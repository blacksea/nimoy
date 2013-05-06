/*{
  "id":"test",
	"scope":["server"],
	"desc":"test module"
}*/

var telepath = require('tele')

module.exports = function () {
  var self = this
  , var id = new Date().getTime()
  telepath(this)

  this.recv = function (data) {
    console.dir('test: '+data)
  }

  setInterval(function () {
    var val = Math.random()
    self.send({set:[id,val]})
  }, 200)
  setInterval(function () {
    self.send({get:id})
  }, 75)
}

