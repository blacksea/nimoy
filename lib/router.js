var through = require('through2')
var cuid = require('cuid')

module.exports = function Router (action,type) {
  var reqs = {}

  var s = through.obj(function (d, e, n) {
    if (reqs[d.key]) {
      if (d.value && d.value instanceof Error) { 
        reqs[d.key](d.value, null)
      } else {
        reqs[d.key](null,JSON.parse(d.value))
      }
      delete reqs[d.key]
    }
    n()
  })

  s.get = function (actor, cb) {
    var id = cuid()
    reqs[id] = cb
    if (!action||!type) s.push(actor + '/' + id)
    else s.push(action + type+actor + '/' + id)
  }

  return s
}
