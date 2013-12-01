var through = require('through')

module.exports = Mdisp

function Mdisp (template) {
  var self = this
  this.s = through(write, end,{autoDestroy:false})

  function write (chunk) {
    this.queue(chunk)
  }

  function end () {
    this.emit('end')
  }

  render(template)

  function render (html) {
    var container = document.getElementById('container')
    disp = document.createElement('div')
    disp.innerHTML = html
    container.appendChild(disp)
  }
}
