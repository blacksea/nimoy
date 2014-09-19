var t = require('templayed') 
var dex = require('./dex.js')
var patcher = require('html-patcher')

module.exports = function (opts) { 
  if (!opts.template || !opts.parent) return null

  // attach id!
   
  var html
  var patch 
  var index

  function draw (data, cb) {
    if (!index && data) index = dex({template:opts.template,data:data})

    html = t(opts.template)(data) 

    if (!patch) {
      patch = patcher(opts.parent, html, function (e) {
        if (e && cb) cb(e)
        if (!e) { if (opts.events) bind(true); if (cb) cb() }
      })
    } else { if (cb) patch(html,cb); else patch(html) }
  }

  function erase (cb) {
    if (!patch) return false
    if (opts.events) bind(false)
    patch('<!-- -->') // clear!?
    if (cb) cb()
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

  // retain a map if its editable! -- indicate editability! / exposure

  return { draw: draw, erase: erase }
}
