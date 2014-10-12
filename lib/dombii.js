var t = require('templayed') 
var patcher = require('html-patcher')

module.exports = function (opts) { 
  if (!opts.template || !opts.parent) return null

  if (opts.id) localStorage[opts.id] = opts.template

  var index
  var patch 

  function render (d) {
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

  return {
    draw : function (data, cb) { // also allow piecmeal data updates
      if (opts.id) localStorage[opts.id] = JSON.stringify(opts.template,data)
      if (!patch) {
        patch = patcher(opts.parent, render(data), function (e) {
          if (e && cb) cb(e)
          if (!e) { if (opts.events) bind(true); if (cb) cb() }
        })
      } else { if (cb) patch(render(data),cb); else patch(render(data)) }
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
