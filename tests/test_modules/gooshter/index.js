var through = require('through2')

module.exports = function gooshter (opts) {

  var s = through.obj(function (d, enc, next) {
    if (typeof d === 'object' && d.key && d.value) {
      var i = dex(d.key.split(':')[1],cmds)
      p.write([i,d])
    }
    next()
  })

  setInterval(function () {
    var t = new Date().getTime().toString()
    s.push(t)
  })

  return s
}
