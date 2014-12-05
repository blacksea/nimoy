var _ = require('underscore')
var through = require('through2')
var D = require('../../../lib/dombii.js')

module.exports = function ($) {
  var t // template
  var s = through.obj()
  var data
  var meta

  function filterMeta (r) {
    var res = _.filter(r, function (o) { return(o.value.tags === data.filter)})
    res = _.sortBy(res, function (o) { return o.value.freshness })
    return res.reverse()
  }

  function filterProjects (r) {
    var res = _.each(meta, function (o,i,l) {
      var key = o.key.replace('~','$')
      l[i] = _.findWhere(r, { key : key })
    })
    return _.map(res, function (o) { return o.value })
  }

  $.on('data', function (d) { 
    if (d.nimoy) {
      t = new D(d) 
      data = d.data 
      t.draw(data)
      $.write('?~*')
      $.write('?$*')
    } else  {
      if (d.value instanceof Array) {
        var r = d.value
        if (d.cmd[1] === '~') meta = filterMeta(r)
        if (d.cmd[1] === '$') data.projects = filterProjects(r)
        t.draw(data)
      } else {
        data = d
        t.draw(data)
      }
    }
  })
  
  s.on('close', function () { t.erase() })

  return {s:s, $:$}
}
