/*{
  "id":"raspi",
	"scope":["server"],
	"desc":"raspberry pi gpio interface"
}*/
var telepath = require('tele')

module.exports = function () {
  var self = this
  , element = null
  telepath(this)

  this.recv = function (buffer) {
    var data = JSON.parse(buffer.toString())
    console.dir(data)
    if (data.dest==='mdisp') {
     console.log('write!') 
    }
  }

  this.render = function (html) {
    var container = document.getElementById('container')
    disp = document.createElement('div')
    disp.innerHTML = html
    container.appendChild(disp)
  }
}