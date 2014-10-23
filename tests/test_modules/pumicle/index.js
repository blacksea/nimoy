var through = require('through2')
var D = require('../../../lib/dombii.js')
var PUMICLE = require('fs').readFileSync(__dirname+'/p.hogan','utf8')

// set image size using the template 

module.exports = function pumicle (opts, $) {
  var pum = new D({template : PUMICLE, parent : document.body, id : opts.id})

  $.on('data', function (d) { console.log(d);pum.draw(d) })

  var s = through.obj(function (data, enc, next) {
    next()
  })

  pum.draw({txt : 'fzf', src : '/files/ban.png', w: 200, h:100})

  s.on('close', pum.erase)

  return {s:s, $:$}
}
