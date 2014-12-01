var through = require('through2')

module.exports = through.obj(function (d,e,n) {
  if (d===undefined) {n();return false} // ?hmmmm
  var link = (d==='/home') ? '/' : d
  history.pushState({cmd:d},'',link)
  if (d==='/') d = '/home'
  this.push('!#'+d.slice(1))
  n()
})
