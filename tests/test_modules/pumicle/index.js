var through = require('through2')

module.exports = function pumicle (opts, $) {
  $.on('data', function (d) {
  })

  var s = through.obj(function (data, enc, next) {
    next()
  })

  setTimeout(function () {
    var d = {x:90}
    $.write(d)
  },1)

  return {s:s, $:$}
}
