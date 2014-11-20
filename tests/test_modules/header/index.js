var through = require('through2')
var D = require('../../../lib/dombii.js')
var HEADER = require('fs').readFileSync(__dirname+'/head.hogan','utf8')

module.exports = function pumicle (opts, $) {
  var pum = new D({template : HEADER, parent : document.body, id : opts.id})
  $.on('data', function (d) { pum.draw(d) })
  var s = through.obj(function (data, enc, next) {
    next()
  })
  s.on('close', pum.erase)
  return {s:s, $:$}
}
