var through = require('through2')
var D = require('../../../lib/dombii.js')

module.exports = function ($) { // a shell that wraps input data into vis and binds events

  var t // template
  var s = through.obj()

  $.on('data', function (d) { 
    if (d.nimoy) t = new D(d)
    else t.draw(d) 
  })

  s.on('close', function () {t.erase()})

  return {s:s, $:$}
}
