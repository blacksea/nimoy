var through = require('through2')

module.exports = function (id) {
  var s = through.obj(function (d,enc,next) {
    this.push(d*10)
  })
  return s
}
