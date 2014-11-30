var through = require('through2')

module.exports = through.obj(function (d,e,n) {
  var link = (d==='/home') ? '/' : d
  history.pushState({cmd:d},'',link)
  if (d==='/') d = '/home'
  this.push('!#'+d.slice(1))
  n()
})
