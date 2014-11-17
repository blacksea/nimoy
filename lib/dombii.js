var _ = require('underscore')
var t = require('templayed') 
var patcher = require('html-patcher')

module.exports = function (opts) { 
  if (!opts.template || !opts.parent) return null

  if (opts.id) localStorage[opts.id] = opts.template

  var self = this
  var patch 

  function render (d) {
    var html = (!d) ? opts.template : t(opts.template)(d) 
    if (opts.id) return '<div id="'+opts.id+'">'+html+'</div>' 
    return html
  }

  function bind (bool) {
    var b = (bool) ? 'addEventListener' : 'removeEventListener' 

    opts.events.forEach(function (e) {
      var selector = (typeof e[0] === 'string') 
        ? opts.parent.querySelectorAll(e[0])
        : e[0] 

      if (selector instanceof NodeList) {
        _.each(selector, function (el) {
          el[b](e[1],e[2],false)
        })
      } else {
        selector[b](e[1],e[2],false)
      }
    })
  }

  function dragPanel (ev) { ///// make generic
    if (ev && ev.target.className==='omni') {
      var top = ev.pageY - ev.target.offsetTop
      var left = ev.pageX - ev.target.offsetLeft
      document.onmousemove = function (e) {
        dx.y = e.pageY-top+'px'
        dx.x = e.pageX-left+'px'
        omni.draw(dx)
        e.preventDefault()
      }
      ev.preventDefault()
    } else {
      document.onmousemove = null
      localStorage['omniPos'] = JSON.stringify([dx.x,dx.y])
    }
  }

  this.draw = function (data,cb) {// also allow small incremental updates
    if (data) self.data = data // expose data
    if (!data && self.data) data = self.data
    if (opts.id) 
      localStorage[opts.id] = JSON.stringify(
        {template:opts.template,data:data}
      )
    if (!patch) {
      patch = patcher(opts.parent, render(data), function (e) {
        if (e && cb) cb(e)
        if (!e) { if (opts.events) bind(true); if (cb) cb() }
      })
    } else { if (cb) patch(render(data),cb); else patch(render(data)) }
  } 

  this.erase = function (cb) {
    if (!patch) return false
    if (opts.events) bind(false)
    patch('<!-- -->') // clear!?
    patch = null
    if (cb) cb()
  }
}
