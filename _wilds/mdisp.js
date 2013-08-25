/*{
  "id":"mdisp",
	"scope":["client"],
	"desc":"micro display",
  "deps":["mdisp.html","mdisp.styl"]
}*/
var stream = require('stream')
, inherits = require('inherits')

function mdisp (template) {
  stream.Stream.call(this)
  this.readable = true
  this.writable = true
  var self = this
  , element = null

  this._read = function (size) {}
  this.write = function (chunk) {
    console.log(chunk)
  }

  render(template)

  function render (html) {
    var container = document.getElementById('container')
    disp = document.createElement('div')
    disp.innerHTML = html
    container.appendChild(disp)
  }
}
inherits(mdisp,stream.Stream)
module.exports = mdisp 
