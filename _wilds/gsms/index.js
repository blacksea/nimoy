// GSMS

var through = require('through')

module.exports = Gsms

function Gsms (template) {
  var self = this
  this.s = through(write,end,{autoDestroy:false})

  function write (chunk) {
    console.log(chunk)
  }

  function end () {
    console.log('stream end')
  }
}
