var through = require('through2')
var D = require('../../../lib/dombii.js')

module.exports = function ($) {

  var t // template
  var s = through.obj()

  $.on('data', function (d) { 
    if (d.nimoy) {
      d.events = [['.menu li a','click',function (e) {
        e.preventDefault(); openUrl.write(e.target.parentElement.pathname)
      }]]

      t = new D(d)
    }
    else t.draw(d) 
  })

  s.on('close', function () {t.erase()})

  return {s:s, $:$}
}
