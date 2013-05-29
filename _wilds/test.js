/*{
  "id":"test",
	"scope":["server"],
	"desc":"test module"
}*/

var telepath = require('tele')

module.exports = function () {
  var self = this
  , id = new Date().getTime()
  telepath(this)

  this.recv = function (json) {
    var data = JSON.parse(json)
    console.dir(data)
  }

  setInterval(function () { // setting redis key
    var val = Math.random()
    self.send({set:[id,val]})
  }, 400)

  setInterval(function () { // getting redis key
    self.send({get:id})
  }, 800)
}

