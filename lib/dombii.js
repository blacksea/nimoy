var t = require('templayed') 
var dex = require('./dex.js')
var patcher = require('html-patcher')

module.exports = function (opts) { 
  if (!opts.template || !opts.parent) return null

  var index
  var patch 

  function html (d) {
    var html = (!d) ? opts.template : t(opts.template)(d) 
    if (opts.id) return '<div id="'+opts.id+'">'+html+'</div>' 
    return html
  }

  function bind (yes) {
    var b = (yes) ? 'addEventListener' : 'removeEventListener' 

    opts.events.forEach(function (e) {
      var selector = (typeof e[0] === 'string') 
        ? opts.parent.querySelector(e[0])
        : e[0] 

      selector[b](e[1],e[2],false)
    })
  }

  function makeDex (d) {
    index = dex({template:opts.template,data:d})
    localStorage[opts.id] = JSON.stringify(index)
  }

  return {
    draw : function (data, cb) {
      if (!index && data && opts.id) makeDex(data)
      if (!patch) {
        patch = patcher(opts.parent, html(data), function (e) {
          if (e && cb) cb(e)
          if (!e) { if (opts.events) bind(true); if (cb) cb() }
        })
      } else { if (cb) patch(html(data),cb); else patch(html(data)) }
    }, 
    erase : function (cb) {
      if (!patch) return false
      if (opts.events) bind(false)
      patch('<!-- -->') // clear!?
      patch = null
      if (cb) cb()
    }
  }
}
