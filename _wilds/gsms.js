/*{
  "id":"gsms",
	"process":["node"],
	"desc":"google voice sms interface"
}*/

//, gsms = require('gsms')
var through = require('through')

module.exports = Gsms

function Gsms (template) {
  var self = this
  this.s = through(write,end,{autoDestroy:false})

  function write (chunk) {
  }
  function end () {
  }

  render(template)

  function render (html) {
    console.log(html)
    var container = document.getElementById('container')
    , log = document.createElement('div')
    log.innerHTML = html
    container.appendChild(log)
    var form = document.getElementById('x')
    , prompt = form.querySelector('.console')

    form.onsubmit = function (e) {
      e.preventDefault()
      var cmd = e.target[0].value
      self.emit('data', JSON.stringify({cmd:cmd}))
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
