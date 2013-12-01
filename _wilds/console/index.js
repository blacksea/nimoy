// CONSOLE

var through = require('through')

module.exports = Console

function Console (template) {
  var self = this

  this.s = through(write, end, {autoDestroy:false})
  function write (chunk) {
    this.queue(chunk)
  }
  function end () {
    this.emit('end')
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
      self.s.write(JSON.stringify({cmd:cmd}))
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
