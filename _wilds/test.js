/*{
  "id":"test",
	"scope":["server"],
	"desc":"test module"
}*/

var telepath = require('tele')

module.exports = function () {
  var self = this
  , id = new Date().getTime()
  console.dir(id)
  telepath(this)

  this.recv = function (json) {
    var data = JSON.parse(json)
    console.dir('test recv: '+data)
  }

  setInterval(function () {
    var val = Math.random()
    self.send({set:[id,val]})
  }, 400)

  setInterval(function () {
    self.send({get:id})
  }, 800)
}

