/*{
  "id":"gsms",
	"scope":["server"],
	"desc":"google voice sms interface"
}*/

var stream = require('stream')
, inherits = require('inherits')

function Console (template) {
  if (!(this instanceof Console)) return new Console(template)
  stream.Stream.call(this)
  this.readable = true
  this.writable = true
  this._buffer = []
  var self = this

  this.write = function (chunk, enc, next) {
    console.log(chunk)
  }

  this._read = function (size) {}

  this.end = function () {}

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

inherits(Console,stream.Stream)
module.exports = Console
