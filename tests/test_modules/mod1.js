var through = require('through2')
module.exports = function (id) {

  var s = through.obj(function (d, enc, next) {
    this.push(d)
    next()
  })

  var max = 200
  var min = 0

  var t = setInterval(function () {
    var i = Math.random() * (max - min) + min
    s.write(i)
  }, 20)

  s.destroy = function () {
    clearInterval(t)
    s.push(null)
  }

  return s
}
