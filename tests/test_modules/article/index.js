var through = require('through2')
var D = require('../../../lib/dombii.js')

module.exports = function ($) { 

  var t // template
  var s = through.obj()

  $.on('data', function (d) { 
    if (d.nimoy) {
      t = new D(d)
      t.draw(d.data)
    }
    else t.draw(d) 
  })

  s.on('close', function () {t.erase()})

  return {s:s, $:$}
}
