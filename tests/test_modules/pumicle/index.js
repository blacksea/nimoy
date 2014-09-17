var through = require('through2')

module.exports = function pumicle (opts) {

  var s = through.obj(function (d, enc, next) {
    console.log(d)
    next()
  })

  return s
}
