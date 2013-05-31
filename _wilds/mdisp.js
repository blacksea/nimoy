/*{
  "id":"mdisp",
	"scope":["client"],
	"desc":"micro display",
  "deps":["mdisp.html","mdisp.styl"]
}*/
var telepath = require('tele')

module.exports = function () {
  var self = this
  telepath(this)

  this.recv = function (buffer) {
    var data = JSON.parse(buffer.toString())
    console.dir(data)
  }

  this.render = function (html) {
    var container = document.getElementById('container')
    , log = document.createElement('div')
    log.innerHTML = html
    container.appendChild(log)
    var form = document.getElementById('x')
    , prompt = form.querySelector('.console')

    form.onsubmit = function (e) {
      e.preventDefault()
      var cmd = e.target[0].value
      self.send({cmd:cmd})
      prompt.blur()
    }

    prompt.onfocus = function () {
      prompt.value = ''
    }

    prompt.onblur = function () {
      prompt.value = ''
    }
  }
}
