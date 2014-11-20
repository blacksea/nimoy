var through = require('through2')
var D = require('../../../lib/dombii.js')
var PROJECT = require('fs').readFileSync(__dirname+'/proj.hogan','utf8')

module.exports = function project (opts, $) {

  var proj = new D({
    template : PROJECT, 
    parent : document.body, 
    id : opts.id,
    events : [
      ['.thumbs li a', 'click', function (e) {
        e.preventDefault()
        console.log(e)
      }]
    ]
  })

  $.on('data', function (d) { proj.draw(d) })

  var s = through.obj(function (data, enc, next) { next() })
  s.on('close', proj.erase)

  return {s:s, $:$}
}
