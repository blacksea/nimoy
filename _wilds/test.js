/*{
  "id":"test",
	"scope":["server"],
	"desc":"test module"
}*/

var telepath = require('tele')

module.exports = function () {
  var self = this
  telepath(this)

  this.recv = function (data) {
    console.dir('test: '+data)


  }

}

