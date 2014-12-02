var through = require('through2')
var D = require('../../../lib/dombii.js')

module.exports = function ($) {

  var t // template
  var s = through.obj()

  $.on('data', function (d) { 
    console.log('CAT',d)
    if (d.nimoy) t = new D(d)

    // grabs an array of data!  

    // else t.draw(d) 
  })

  $.write('?$*')

  s.on('close', function () {t.erase()})

  return {s:s, $:$}
}
