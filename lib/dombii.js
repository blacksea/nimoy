var t = require('templayed') 
var dex = require('./dex.js')
var patcher = require('html-patcher')

module.exports = function (opts) { 
  if (!opts.template || !opts.parent) return null

  var index
  var patch 
  var html = opts.template

  function wrapID (markup) { 
    var res = (!opts.id) ? markup : '<div id="'+opts.id+'">'+markup+'</div>' 
    return res
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
      if (data) html = t(html)(data) 
      html = wrapID(html)
      if (!patch) {
        patch = patcher(opts.parent, html, function (e) {
          if (e && cb) cb(e)
          if (!e) { if (opts.events) bind(true); if (cb) cb() }
        })
      } else { if (cb) patch(html,cb); else patch(html) }
    }, 
    erase : function (cb) {
      if (!patch) return false
      if (opts.events) bind(false)
      patch('<!-- -->') // clear!?
      if (cb) cb()
    }
  }
}
