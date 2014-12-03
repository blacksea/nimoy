var _ = require('underscore')
var through = require('through2')
var D = require('../../../lib/dombii.js')

module.exports = function ($) {

  var t // template
  var s = through.obj()

  $.on('data', function (d) { 

    if (d.nimoy) t = new D(d) 
    else  {
      var res = d.value
      _.each(res,function (data) { // parse keys!
        console.log(JSON.parse(data.value))
      })
    }
    // make template 
    // grabs an array of data!  
    // filters / formats and then does the render!
    // else t.draw(d) 
  })

  $.write('?~*')

  s.on('close', function () { t.erase() })

  return {s:s, $:$}
}
