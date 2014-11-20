var through = require('through2')
var D = require('../../../lib/dombii.js')
var PUMICLE = require('fs').readFileSync(__dirname+'/art.hogan','utf8')

module.exports = function pumicle (opts, $) {

  var pum = new D({template : PUMICLE, parent : document.body, id : opts.id})
  $.on('data', function (d) { pum.draw(d) })

  var s = through.obj(function (data, enc, next) {
    next()
  })

  s.on('close', pum.erase)
  return {s:s, $:$}
}
