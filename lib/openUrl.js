var through = require('through2')

module.exports = through.obj(function (d,e,n) {
    history.pushState({cmd:'!#'+d},'',d)
    if (d==='/') d = '/home'
    console.log(d)
    this.push('!#'+d.slice(1))
    n()
  })
